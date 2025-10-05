import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { DetectionService } from './detection.service';
import { FileStorageService } from './file-storage.service';
import { Report, ReportStatus } from '../models/report.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly detectionService: DetectionService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   * Create a new trash report with before image
   * @param userId - The user creating the report
   * @param beforeImage - The uploaded before image file
   * @returns The created report with detection results and random prompt
   */
  async createReport(
    userId: string,
    beforeImage: Express.Multer.File,
  ): Promise<Report> {
    // Generate unique report ID
    const reportId = uuidv4();

    // Save before image to local storage with organized path
    const prefix = `${userId}/${reportId}`;
    const beforeImagePath = await this.fileStorageService.saveFile(
      beforeImage,
      prefix,
    );

    // Call detection service for trash prediction
    const predictionResult =
      await this.detectionService.predictTrash(beforeImagePath);

    // Create report entity
    const reportData: Partial<Report> = {
      reportId,
      userId,
      beforeImagePath,
      detectionResult: predictionResult.detection_result,
      randomPrompt: predictionResult.random_prompt,
      status: ReportStatus.AWAITING_CLEAN,
    };

    // Save to repository
    const report = await this.reportRepository.create(reportData);

    return report;
  }

  /**
   * Get a report by its ID
   * @param reportId - The unique report identifier
   * @returns The report if found
   * @throws NotFoundException if report doesn't exist
   */
  async getReportById(reportId: string): Promise<Report> {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException(`Report with ID ${reportId} not found`);
    }

    return report;
  }
}
