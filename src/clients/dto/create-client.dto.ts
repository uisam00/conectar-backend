import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'Empresa ABC Ltda',
  })
  razaoSocial: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'ABC Comércio',
    required: false,
  })
  nomeComercial?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  statusId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  planId: number;
}
