import { Controller, Get, HttpCode, HttpStatus, Version } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({
  path: 'health',
})
export class HealthController {
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
}
