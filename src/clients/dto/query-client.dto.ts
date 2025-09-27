import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryClientDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'ABC',
    description: 'Search term for razaoSocial, nomeComercial, or CNPJ',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'Empresa ABC',
    description: 'Filter by client name (razaoSocial or nomeComercial)',
  })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Filter by status ID',
  })
  statusId?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Filter by plan ID',
  })
  planId?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
  })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    required: false,
    example: 10,
  })
  limit?: number;
}
