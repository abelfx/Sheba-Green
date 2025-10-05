import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = this.getErrorName(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || this.getErrorName(status);
      } else {
        message = exception.message;
        error = this.getErrorName(status);
      }
    } else {
      // Handle non-HTTP exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors for debugging
      this.logger.error(
        `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // Sanitize error messages to prevent sensitive information exposure
    const sanitizedMessage = this.sanitizeMessage(message);

    const errorResponse: ErrorResponseDto = {
      statusCode: status,
      message: sanitizedMessage,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log the error with appropriate level
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${sanitizedMessage}`,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${sanitizedMessage}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Get human-readable error name from HTTP status code
   */
  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      default:
        return 'Error';
    }
  }

  /**
   * Sanitize error messages to prevent exposure of sensitive information
   * such as private keys, database credentials, etc.
   */
  private sanitizeMessage(message: string | string[]): string {
    const messages = Array.isArray(message) ? message : [message];
    const sanitized = messages.map((msg) => {
      // Remove potential private keys (hex strings that look like keys)
      let sanitizedMsg = msg.replace(
        /[0-9a-fA-F]{64,}/g,
        '[REDACTED_SENSITIVE_DATA]',
      );

      // Remove potential connection strings
      sanitizedMsg = sanitizedMsg.replace(
        /mongodb:\/\/[^\s]+/gi,
        'mongodb://[REDACTED]',
      );

      // Remove potential API keys or tokens
      sanitizedMsg = sanitizedMsg.replace(
        /(?:api[_-]?key|token|secret|password)["\s:=]+[^\s"']+/gi,
        '[REDACTED_CREDENTIALS]',
      );

      return sanitizedMsg;
    });

    return Array.isArray(message) ? sanitized.join(', ') : sanitized[0];
  }
}
