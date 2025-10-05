import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyCleanupDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'Unique identifier for the report being verified',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  reportId!: string;

  @ApiProperty({
    description: 'Verification prompt provided to the user',
    example: 'Show the cleaned area with a thumbs up',
  })
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
