import { Controller, Get, HttpCode, HttpStatus, Version } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MailerService } from '../mailer/mailer.service';

@ApiTags('Health')
@Controller({
  path: 'health',
})
export class HealthController {
  constructor(private readonly mailerService: MailerService) {}
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

  @Get('smtp')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'SMTP service health check' })
  public async checkSmtp() {
    try {
      // Test SMTP connection by verifying the transporter
      await this.mailerService['transporter'].verify();
      
      return {
        status: 'ok',
        service: 'smtp',
        message: 'SMTP connection successful',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'smtp',
        message: `SMTP connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
