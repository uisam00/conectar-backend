import { Injectable } from '@nestjs/common';
import { MailerService } from '../../../mailer/mailer.service';
import { HealthRepository } from '../health.repository.interface';

@Injectable()
export class HealthRepositoryImpl implements HealthRepository {
  constructor(private readonly mailerService: MailerService) {}

  checkHealth(): Promise<{
    status: string;
    uptime: number;
    timestamp: string;
  }> {
    return Promise.resolve({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  async testSmtpConnection(
    email: string,
    message: string,
  ): Promise<{
    status: string;
    service: string;
    message: string;
    emailSent: boolean;
    recipient: string;
    timestamp: string;
  }> {
    try {
      await this.mailerService['transporter'].verify();

      await this.mailerService.sendMail({
        to: email,
        subject: 'Teste de Conectividade SMTP',
        html: `
          <h2>Teste de Conectividade SMTP</h2>
          <p><strong>Mensagem:</strong> ${message}</p>
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
        recipient: email,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'smtp',
        message: `SMTP test failed: ${error.message}`,
        emailSent: false,
        recipient: email,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
