import { Controller, Get, HttpCode, HttpStatus, Version, Post, Body, BadRequestException, ForbiddenException, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { SmtpTestDto } from './dto/smtp-test.dto';
import { Request } from 'express';

@ApiTags('Health')
@Controller({
  path: 'health',
})
export class HealthController {
  private readonly smtpTestAttempts = new Map<string, { count: number; lastReset: number }>();

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }
  @Get()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Service health check' })
  public check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('smtp')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'SMTP service health check with email test' })
  @ApiBody({ type: SmtpTestDto })
  public async testSmtp(@Body() smtpTestDto: SmtpTestDto, @Req() req: Request) {
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv !== 'development' && nodeEnv !== 'homologation') {
      throw new ForbiddenException('Este endpoint só está disponível em ambiente de desenvolvimento ou homologação');
    }

    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    const attempts = this.smtpTestAttempts.get(clientIp);

    if (attempts) {
      if (now - attempts.lastReset < fiveMinutes) {
        if (attempts.count >= 3) {
          throw new BadRequestException('Limite de 3 tentativas a cada 5 minutos excedido');
        }
        attempts.count++;
      } else {
        this.smtpTestAttempts.set(clientIp, { count: 1, lastReset: now });
      }
    } else {
      this.smtpTestAttempts.set(clientIp, { count: 1, lastReset: now });
    }

    try {
      await this.mailerService['transporter'].verify();

      await this.mailerService.sendMail({
        to: smtpTestDto.email,
        subject: 'Teste de Conectividade SMTP',
        html: `
          <h2>Teste de Conectividade SMTP</h2>
          <p><strong>Mensagem:</strong> ${smtpTestDto.message}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> ✅ SMTP funcionando corretamente</p>
        `,
        templatePath: undefined,
        context: {},
      });

      return {
        status: 'ok',
        service: 'smtp',
        message: 'SMTP connection successful and test email sent',
        emailSent: true,
        recipient: smtpTestDto.email,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'smtp',
        message: `SMTP test failed: ${error.message}`,
        emailSent: false,
        recipient: smtpTestDto.email,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
