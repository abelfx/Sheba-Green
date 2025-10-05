import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user123',
  })
  userId!: string;

  @ApiProperty({
    description: 'Token balance amount',
    example: 10,
  })
  balance!: number;

  @ApiProperty({
    description: 'Token symbol',
    example: 'SHEBA',
  })
  tokenSymbol!: string;
}
