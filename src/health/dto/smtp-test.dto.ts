import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SmtpTestDto {
  @ApiProperty({
    description: 'Email para teste de conectividade SMTP',
    example: 'test@example.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Mensagem personalizada para o teste',
    example: 'Teste de conectividade SMTP',
  })
  @IsString({ message: 'Mensagem deve ser uma string' })
  @IsNotEmpty({ message: 'Mensagem é obrigatória' })
  message: string;
}
