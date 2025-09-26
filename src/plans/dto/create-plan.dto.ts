import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

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
    example: 99.90,
    required: false,
  })
  price?: number;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    type: Object,
    example: {
      maxUsers: 10,
      maxStorage: '1GB',
      features: ['email', 'support']
    },
    required: false,
  })
  features?: Record<string, any>;
}
