import { ApiProperty } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the report',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  reportId!: string;

  @ApiProperty({
    description: 'User ID who created the report',
    example: 'user123',
  })
  userId!: string;

  @ApiProperty({
    description: 'File path to the before image',
    example:
      './uploads/user123/550e8400-e29b-41d4-a716-446655440000/before.jpg',
  })
  beforeImagePath!: string;

  @ApiProperty({
    description: 'File path to the after image',
    example: './uploads/user123/550e8400-e29b-41d4-a716-446655440000/after.jpg',
    required: false,
  })
  afterImagePath?: string;

  @ApiProperty({
    description: 'Detection result from AI service',
    example: { detected: true, confidence: 0.95 },
  })
  detectionResult!: any;

  @ApiProperty({
    description: 'Random prompt generated for verification',
    example: 'Show the cleaned area with a thumbs up',
  })
  randomPrompt!: any;

  @ApiProperty({
    description: 'Verification result from AI service',
    example: { verified: true, reason: 'Cleanup confirmed' },
    required: false,
  })
  verificationResult?: any;

  @ApiProperty({
    description: 'Current status of the report',
    example: 'AWAITING_CLEAN',
    enum: ['AWAITING_CLEAN', 'VERIFIED', 'REJECTED'],
  })
  status!: string;

  @ApiProperty({
    description: 'Token transfer transaction ID',
    example: '0.0.123456@1234567890.123456789',
    required: false,
  })
  tokenTxId?: string;

  @ApiProperty({
    description: 'HCS message ID',
    example: '0.0.789012@1234567890.123456789',
    required: false,
  })
  hcsMessageId?: string;

  @ApiProperty({
    description: 'Timestamp when the report was created',
    example: '2025-10-04T12:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the report was last updated',
    example: '2025-10-04T13:00:00.000Z',
    required: false,
  })
  updatedAt?: Date;
}
