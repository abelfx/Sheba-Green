import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dtos/requests/create-report.dto';
import { ReportResponseDto } from '../dtos/responses/report-response.dto';
import { ErrorResponseDto } from '../dtos/responses/error-response.dto';

@ApiTags('Reports')
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('beforeImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new trash report',
    description:
      'Upload a before image of trash and receive detection results with a random cleanup prompt',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId', 'beforeImage'],
      properties: {
        userId: {
          type: 'string',
          description: 'Unique identifier for the user creating the report',
          example: 'user123',
        },
        beforeImage: {
          type: 'string',
          format: 'binary',
          description: 'Image file showing trash before cleanup',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or missing file',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - Detection service is down',
    type: ErrorResponseDto,
  })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReportResponseDto> {
    const report = await this.reportService.createReport(
      createReportDto.userId,
      file,
    );

    return {
      reportId: report.reportId,
      userId: report.userId,
      beforeImagePath: report.beforeImagePath,
      afterImagePath: report.afterImagePath,
      detectionResult: report.detectionResult,
      randomPrompt: report.randomPrompt,
      verificationResult: report.verificationResult,
      status: report.status,
      tokenTxId: report.tokenTxId,
      hcsMessageId: report.hcsMessageId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific report with all its details',
  })
  @ApiResponse({
    status: 200,
    description: 'Report found',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
    type: ErrorResponseDto,
  })
  async getReport(@Param('id') id: string): Promise<ReportResponseDto> {
    const report = await this.reportService.getReportById(id);

    return {
      reportId: report.reportId,
      userId: report.userId,
      beforeImagePath: report.beforeImagePath,
      afterImagePath: report.afterImagePath,
      detectionResult: report.detectionResult,
      randomPrompt: report.randomPrompt,
      verificationResult: report.verificationResult,
      status: report.status,
      tokenTxId: report.tokenTxId,
      hcsMessageId: report.hcsMessageId,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
