import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class Client {
  @Allow()
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Empresa ABC Ltda',
  })
  razaoSocial: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: '12.345.678/0001-90',
  })
  cnpj: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'ABC Comércio',
  })
  nomeComercial?: string;

  @Allow()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  statusId: number;

  @Allow()
  @ApiProperty({
    type: Number,
    example: 1,
  })
  planId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;
}
