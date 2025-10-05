import { HttpExceptionFilter } from './http-exception.filter';
import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HTTP Exception Handling', () => {
    it('should handle NotFoundException (404)', () => {
      const exception = new NotFoundException('Report not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Report not found',
          error: 'Not Found',
          path: '/api/v1/test',
        }),
      );
    });

    it('should handle BadRequestException (400)', () => {
      const exception = new BadRequestException('Invalid request data');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.BAD_REQUEST,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid request data',
          error: 'Bad Request',
        }),
      );
    });

    it('should handle UnprocessableEntityException (422)', () => {
      const exception = new UnprocessableEntityException(
        'Please set your Hedera account ID',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 422,
          message: 'Please set your Hedera account ID',
          error: 'Unprocessable Entity',
        }),
      );
    });

    it('should handle ServiceUnavailableException (503)', () => {
      const exception = new ServiceUnavailableException(
        'AI Detection service is currently unavailable',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 503,
          message: 'AI Detection service is currently unavailable',
          error: 'Service Unavailable',
        }),
      );
    });

    it('should handle InternalServerErrorException (500)', () => {
      const exception = new InternalServerErrorException(
        'Failed to process blockchain transaction',
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Failed to process blockchain transaction',
          error: 'Internal Server Error',
        }),
      );
    });
  });

  describe('Error Response Structure', () => {
    it('should include timestamp in error response', () => {
      const exception = new NotFoundException('Not found');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should include request path in error response', () => {
      const exception = new NotFoundException('Not found');

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.path).toBe('/api/v1/test');
    });
  });

  describe('Sensitive Information Sanitization', () => {
    it('should sanitize private keys from error messages', () => {
      const privateKey =
        '302e020100300506032b657004220420a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
      const exception = new InternalServerErrorException(
        `Failed with key: ${privateKey}`,
      );

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.message).not.toContain(privateKey);
      expect(response.message).toContain('[REDACTED_SENSITIVE_DATA]');
    });

    it('should sanitize MongoDB connection strings', () => {
      const exception = new InternalServerErrorException(
        'Failed to connect to mongodb://user:password@localhost:27017/db',
      );

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.message).not.toContain('user:password');
      expect(response.message).toContain('mongodb://[REDACTED]');
    });

    it('should sanitize API keys and tokens', () => {
      const exception = new InternalServerErrorException(
        'Failed with api_key: sk_test_123456789',
      );

      filter.catch(exception, mockArgumentsHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.message).toContain('[REDACTED_CREDENTIALS]');
    });
  });

  describe('Non-HTTP Exception Handling', () => {
    it('should handle generic Error as 500', () => {
      const exception = new Error('Unexpected error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('should handle unknown exceptions as 500', () => {
      const exception = 'Some string error';

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle validation errors with array of messages', () => {
      const exception = new BadRequestException({
        message: ['userId must be a string', 'userId should not be empty'],
        error: 'Bad Request',
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.BAD_REQUEST,
      );
      const response = mockResponse.json.mock.calls[0][0];
      expect(response.message).toContain('userId must be a string');
    });
  });
});
