import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsBoolean,
  IsIn,
} from 'class-validator';
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
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: '12.345.678/0001-90',
    description: 'Filter by client CNPJ',
  })
  cnpj?: string;

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
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
    description: 'Filter clients with special plans only',
  })
  isSpecial?: boolean;

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

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'razaoSocial',
    description: 'Field to sort by',
  })
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @ApiProperty({
    type: String,
    required: false,
    example: 'ASC',
    description: 'Sort order (ASC or DESC)',
  })
  sortOrder?: 'ASC' | 'DESC';
}
