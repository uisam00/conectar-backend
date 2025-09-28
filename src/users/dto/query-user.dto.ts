import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'João Silva',
    description: 'Search term for firstName, lastName, or email',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'João',
    description: 'Filter by first name',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'Silva',
    description: 'Filter by last name',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'joao@example.com',
    description: 'Filter by email',
  })
  email?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Filter by role ID',
  })
  roleId?: number;

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
    description: 'Filter by client ID',
  })
  clientId?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Filter by system role ID',
  })
  systemRoleId?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Filter by client role ID',
  })
  clientRoleId?: number;

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
    example: 'firstName',
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
