import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Overall health status',
    example: 'healthy',
    enum: ['healthy', 'unhealthy'],
  })
  status!: string;

  @ApiProperty({
    description: 'MongoDB connection status',
    example: true,
  })
  mongodb!: boolean;

  @ApiProperty({
    description: 'Hedera network connectivity status',
    example: true,
  })
  hedera!: boolean;

  @ApiProperty({
    description: 'Detection service availability status',
    example: true,
  })
  detectionService!: boolean;

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600,
  })
  uptime!: number;
}
