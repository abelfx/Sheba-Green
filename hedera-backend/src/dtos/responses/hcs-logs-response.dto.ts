import { ApiProperty } from '@nestjs/swagger';

export class HcsMessageDto {
  @ApiProperty({
    description: 'HCS topic ID',
    example: '0.0.789012',
  })
  topicId!: string;

  @ApiProperty({
    description: 'Message content',
    example: {
      reportId: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user123',
      tokenTransferTxId: '0.0.123456@1234567890.123456789',
      timestamp: '2025-10-04T12:00:00.000Z',
    },
  })
  message!: any;

  @ApiProperty({
    description: 'Consensus timestamp',
    example: '1234567890.123456789',
  })
  consensusTimestamp!: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: '0.0.123456@1234567890.123456789',
  })
  txId!: string;

  @ApiProperty({
    description: 'Timestamp when the message was created',
    example: '2025-10-04T12:00:00.000Z',
  })
  createdAt!: Date;
}

export class HcsLogsResponseDto {
  @ApiProperty({
    description: 'Array of HCS messages',
    type: [HcsMessageDto],
  })
  logs!: HcsMessageDto[];

  @ApiProperty({
    description: 'Total count of messages',
    example: 100,
  })
  total!: number;
}
