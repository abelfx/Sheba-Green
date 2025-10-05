import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { Response } from 'express';
import { HederaService } from '../services/hedera.service';
import { DetectionService } from '../services/detection.service';
import { HealthResponseDto } from '../dtos/responses/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime: number;
  private readonly version: string = '0.0.1';

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly hederaService: HederaService,
    private readonly detectionService: DetectionService,
  ) {
    this.startTime = Date.now();
  }

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description:
      'Check the health status of all services including MongoDB, Hedera, and Detection service',
  })
  @ApiResponse({
    status: 200,
    description: 'All services are healthy',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'One or more services are unhealthy',
    type: HealthResponseDto,
  })
  async checkHealth(@Res() res: Response): Promise<Response> {
    // Check MongoDB connection
    const mongoHealthy = this.mongoConnection.readyState === 1;

    // Check Hedera connectivity
    let hederaHealthy = false;
    try {
      hederaHealthy = await this.hederaService.checkHealth();
    } catch (error) {
      hederaHealthy = false;
    }

    // Check Detection service availability
    let detectionServiceHealthy = false;
    try {
      detectionServiceHealthy = await this.detectionService.checkHealth();
    } catch (error) {
      detectionServiceHealthy = false;
    }

    // Determine overall status
    const allHealthy =
      mongoHealthy && hederaHealthy && detectionServiceHealthy;
    const status = allHealthy ? 'healthy' : 'unhealthy';

    // Calculate uptime in seconds
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    const response: HealthResponseDto = {
      status,
      mongodb: mongoHealthy,
      hedera: hederaHealthy,
      detectionService: detectionServiceHealthy,
      version: this.version,
      uptime,
    };

    // Return HTTP 503 if any service is unhealthy
    const statusCode = allHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(response);
  }
}
