import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { IsValidCnpj } from '../validators/cnpj.validator';

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
  @IsValidCnpj({ message: 'CNPJ inválido' })
  @ApiProperty({
    type: String,
    example: '12.345.678/0001-90',
    description: 'CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)',
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
