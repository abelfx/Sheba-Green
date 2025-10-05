import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReportRepository } from '../repositories/report.repository';
import { UserRepository } from '../repositories/user.repository';
import { DetectionService } from './detection.service';
import { HederaService } from './hedera.service';
import { FileStorageService } from './file-storage.service';
import { ReportStatus } from '../models/report.schema';
import { VerificationResult } from '../domain/interfaces/detection-results.interface';

export interface VerificationResponse {
  verified: boolean;
  reason?: string;
  reportId: string;
  tokenTxId?: string;
  hcsMessageId?: string;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly userRepository: UserRepository,
    private readonly detectionService: DetectionService,
    private readonly hederaService: HederaService,
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Verify a cleanup with after image and prompt
   * @param userId - The user submitting the verification
   * @param reportId - The report being verified
   * @param prompt - The cleanup prompt to verify against
   * @param afterImage - The uploaded after image file
   * @returns Verification result with token and HCS information
   */
  async verifyCleanup(
    userId: string,
    reportId: string,
    prompt: string,
    afterImage: Express.Multer.File,
  ): Promise<VerificationResponse> {
    // Validate report exists
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    // Validate report belongs to user
    if (report.userId !== userId) {
      throw new UnprocessableEntityException(
        'Report does not belong to this user',
      );
    }

    // Get user to check for Hedera account
    const user = await this.userRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.hederaAccountId) {
      throw new UnprocessableEntityException(
        'Please set your Hedera account ID in your profile before verifying cleanups',
      );
    }

    // Save after image to local storage
    const prefix = `${userId}/${reportId}`;
    const afterImagePath = await this.fileStorageService.saveFile(
      afterImage,
      prefix,
    );

    // Call detection service for verification
    const verificationResult: VerificationResult =
      await this.detectionService.verifyCleanup(afterImagePath, prompt);

    // Handle verification result
    if (verificationResult.verified) {
      // Verification successful - reward user
      this.logger.log(
        `Cleanup verified for report ${reportId}. Rewarding user ${userId}`,
      );

      // Get reward amount from config (default to 1)
      const rewardAmount =
        this.configService.get<number>('sheba.rewardAmount') || 1;

      // Mint and transfer Sheba tokens
      const tokenResult = await this.hederaService.mintAndTransferSheba(
        user.hederaAccountId,
        rewardAmount,
      );

      // Publish HCS message with verification details
      const hcsPayload = {
        type: 'CLEANUP_VERIFICATION',
        reportId,
        userId,
        tokenTransferTxId: tokenResult.txId,
        verified: true,
        timestamp: new Date().toISOString(),
      };

      const hcsResult =
        await this.hederaService.publishHcsMessage(hcsPayload);

      // Update report with verification success
      await this.reportRepository.update(reportId, {
        status: ReportStatus.VERIFIED,
        afterImagePath,
        verificationResult: verificationResult,
        tokenTxId: tokenResult.txId,
        hcsMessageId: hcsResult.txId,
      });

      return {
        verified: true,
        reportId,
        tokenTxId: tokenResult.txId,
        hcsMessageId: hcsResult.txId,
      };
    } else {
      // Verification failed
      this.logger.log(
        `Cleanup verification failed for report ${reportId}. Reason: ${verificationResult.reason}`,
      );

      // Update report with rejection
      await this.reportRepository.update(reportId, {
        status: ReportStatus.REJECTED,
        afterImagePath,
        verificationResult: verificationResult,
      });

      return {
        verified: false,
        reason: verificationResult.reason,
        reportId,
      };
    }
  }
}
