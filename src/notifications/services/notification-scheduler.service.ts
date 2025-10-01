import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ClientInactivityService } from './client-inactivity.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    private readonly clientInactivityService: ClientInactivityService,
  ) {}

  // Executar todo dia às 6:00 da manhã
  @Cron('0 6 * * *')
  async checkInactiveClients() {
    this.logger.log('🔍 Iniciando verificação de clientes inativos às 6:00 da manhã...');
    try {
      await this.clientInactivityService.generateInactivityNotifications();
      this.logger.log('✅ Verificação de clientes inativos concluída com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro ao verificar clientes inativos:', error);
    }
  }

  // Executar a cada 6 horas para verificação adicional
  @Cron('0 */6 * * *')
  async checkInactiveClientsFrequent() {
    this.logger.log('🔄 Verificação frequente de clientes inativos...');
    try {
      await this.clientInactivityService.generateInactivityNotifications();
      this.logger.log('✅ Verificação frequente concluída!');
    } catch (error) {
      this.logger.error('❌ Erro na verificação frequente:', error);
    }
  }

  // Executar todo domingo à meia-noite para limpeza
  @Cron('0 0 * * 0')
  cleanupOldNotifications() {
    this.logger.log('🧹 Iniciando limpeza de notificações antigas...');
    try {
      // Aqui você pode implementar lógica para limpar notificações antigas
      // Por exemplo, deletar notificações com mais de 30 dias
      this.logger.log('✅ Limpeza de notificações antigas concluída!');
    } catch (error) {
      this.logger.error('❌ Erro na limpeza de notificações:', error);
    }
  }
}