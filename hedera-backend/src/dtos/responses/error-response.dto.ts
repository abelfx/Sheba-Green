import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Report not found',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error!: string;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-04T12:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/v1/reports/550e8400-e29b-41d4-a716-446655440000',
  })
  path!: string;
}
