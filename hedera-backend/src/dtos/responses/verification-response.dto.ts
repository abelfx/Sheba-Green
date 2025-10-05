import { ApiProperty } from '@nestjs/swagger';

export class VerificationResponseDto {
  @ApiProperty({
    description: 'Whether the cleanup was verified',
    example: true,
  })
  verified!: boolean;

  @ApiProperty({
    description: 'Reason for verification result',
    example: 'Cleanup confirmed with prompt completion',
    required: false,
  })
  reason?: string;

  @ApiProperty({
    description: 'Report ID that was verified',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  reportId!: string;

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
}
