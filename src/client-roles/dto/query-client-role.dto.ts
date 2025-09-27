import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryClientRoleDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'admin',
  })
  search?: string;

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
