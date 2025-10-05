import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'Unique identifier for the user creating the report',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
