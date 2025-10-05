import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'user123',
  })
  userId!: string;

  @ApiProperty({
    description: 'Display name for the user',
    example: 'John Doe',
  })
  displayName!: string;

  @ApiProperty({
    description: 'Hedera account ID for the user',
    example: '0.0.123456',
  })
  hederaAccountId!: string;

  @ApiProperty({
    description: 'Optional EVM address for the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: false,
  })
  evmAddress?: string;

  @ApiProperty({
    description: 'Decentralized identifier for the user',
    example: 'did:hedera:testnet:0.0.123456_user123',
    required: false,
  })
  did?: string;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2025-10-04T12:00:00.000Z',
  })
  createdAt!: Date;
}
