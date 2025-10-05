import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { VerificationService } from '../services/verification.service';
import { VerifyCleanupDto } from '../dtos/requests/verify-cleanup.dto';
import { VerificationResponseDto } from '../dtos/responses/verification-response.dto';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@ApiTags('Verifications')
@Controller('api/v1/verifications')
export class VerificationsController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('afterImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Verify a cleanup with after image',
    description:
      'Submit an after image with the cleanup prompt to verify the cleanup and receive Sheba token rewards',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'reportId', 'prompt', 'afterImage'],
      properties: {
        userId: {
          type: 'string',
          description: 'Unique identifier for the user',
          example: 'user123',
        },
        reportId: {
          type: 'string',
          description: 'Unique identifier for the report being verified',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        prompt: {
          type: 'string',
          description: 'Verification prompt provided to the user',
          example: 'Show the cleaned area with a thumbs up',
        },
        afterImage: {
          type: 'string',
          format: 'binary',
          description: 'Image file showing the area after cleanup',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Verification completed successfully',
    type: VerificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or missing file',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report or user not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 422,
    description:
      'Unprocessable entity - User has no Hedera account or report does not belong to user',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - Detection or Hedera service is down',
    type: ErrorResponseDto,
  })
  async verifyCleanup(
    @Body() verifyCleanupDto: VerifyCleanupDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VerificationResponseDto> {
    const result = await this.verificationService.verifyCleanup(
      verifyCleanupDto.userId,
      verifyCleanupDto.reportId,
      verifyCleanupDto.prompt,
      file,
    );

    return {
      verified: result.verified,
      reason: result.reason,
      reportId: result.reportId,
      tokenTxId: result.tokenTxId,
      hcsMessageId: result.hcsMessageId,
    };
  }
}
