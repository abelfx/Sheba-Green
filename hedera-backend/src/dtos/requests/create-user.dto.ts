import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Display name for the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty({
    description: 'Hedera account ID for the user',
    example: '0.0.123456',
  })
  @IsString()
  @IsNotEmpty()
  hederaAccountId!: string;

  @ApiProperty({
    description: 'Optional EVM address for the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  evmAddress?: string;
}
