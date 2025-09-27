import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthRepository,
  HEALTH_REPOSITORY,
} from './infrastructure/health.repository.interface';
import { Environment } from '../config/app.config';

@Injectable()
export class HealthService {
  private readonly smtpTestAttempts = new Map<
    string,
    { count: number; lastReset: number }
  >();

  constructor(
    @Inject(HEALTH_REPOSITORY)
    private readonly healthRepository: HealthRepository,
    private readonly configService: ConfigService,
  ) {}

  async checkHealth() {
    return this.healthRepository.checkHealth();
  }

  async testSmtp(email: string, message: string, clientIp: string) {
    const nodeEnv = this.configService.get<Environment>('app.nodeEnv', {
      infer: true,
    });

    if (nodeEnv !== Environment.Development && nodeEnv !== Environment.Test) {
      throw new BadRequestException(
        'Este endpoint só está disponível em ambiente de desenvolvimento ou teste',
      );
    }

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    const attempts = this.smtpTestAttempts.get(clientIp);

    if (attempts) {
      if (now - attempts.lastReset < fiveMinutes) {
        if (attempts.count >= 3) {
          throw new BadRequestException(
            'Limite de 3 tentativas a cada 5 minutos excedido',
          );
        }
        attempts.count++;
      } else {
        this.smtpTestAttempts.set(clientIp, { count: 1, lastReset: now });
      }
    } else {
      this.smtpTestAttempts.set(clientIp, { count: 1, lastReset: now });
    }

    return this.healthRepository.testSmtpConnection(email, message);
  }
}
