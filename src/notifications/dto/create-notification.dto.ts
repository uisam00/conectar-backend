import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tipo da notificação',
    example: 'client_inactive',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Cliente inativo',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'O cliente XYZ não possui usuários ativos há mais de 30 dias',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Status de leitura da notificação',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean = false;

  @ApiProperty({
    description: 'ID do usuário (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    description: 'ID do cliente (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @ApiProperty({
    description: 'Dados adicionais da notificação',
    example: { clientName: 'Empresa XYZ', daysInactive: 35 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
