import { Controller, Get, HttpCode, HttpStatus, Version, Post, Body, Req } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { SmtpTestDto } from './dto/smtp-test.dto';
import { Request } from 'express';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({
  path: 'health',
})
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) { }
  @Get()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Service health check' })
  public async check() {
    return this.healthService.checkHealth();
  }

  @Post('smtp')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'SMTP service health check with email test' })
  @ApiBody({ type: SmtpTestDto })
  public async testSmtp(@Body() smtpTestDto: SmtpTestDto, @Req() req: Request) {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    
    return this.healthService.testSmtp(smtpTestDto.email, smtpTestDto.message, clientIp);
  }
}
