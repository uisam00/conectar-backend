import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SmtpTestDto {
  @ApiProperty({ 
    example: 'teste@example.com',
    description: 'Email de destino para o teste'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Teste de conectividade SMTP',
    description: 'Mensagem a ser enviada no email de teste'
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
