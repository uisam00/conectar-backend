import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Plano Básico',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Plano ideal para pequenas empresas',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    example: 99.9,
    required: false,
  })
  price?: number;
}
