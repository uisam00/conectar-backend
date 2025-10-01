import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../clients/infrastructure/persistence/relational/entities/client.entity';
import { SessionEntity } from '../../session/infrastructure/persistence/relational/entities/session.entity';
import { UserClientEntity } from '../../users/infrastructure/persistence/relational/entities/user-client.entity';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class ClientInactivityService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserClientEntity)
    private readonly userClientRepository: Repository<UserClientEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findClientsWithoutRecentSessions(daysThreshold: number = 30): Promise<{
    data: Array<{
      clientId: number;
      clientName: string;
      daysInactive: number;
      totalUsers: number;
      inactiveUsers: number;
    }>;
    total: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    // Buscar todos os clientes
    const clients = await this.clientRepository.find();

    const inactiveClients: Array<{
      clientId: number;
      clientName: string;
      daysInactive: number;
      totalUsers: number;
      inactiveUsers: number;
    }> = [];

    for (const client of clients) {
      // Buscar usuários associados a este cliente
      const userClients = await this.userClientRepository.find({
        where: { clientId: client.id },
        relations: ['user'],
      });

      // Buscar a última sessão de qualquer usuário deste cliente
      const lastSession = await this.sessionRepository
        .createQueryBuilder('session')
        .leftJoin('session.user', 'user')
        .leftJoin('user.userClients', 'userClient')
        .where('userClient.clientId = :clientId', { clientId: client.id })
        .orderBy('session.createdAt', 'DESC')
        .getOne();

      if (!lastSession || lastSession.createdAt < cutoffDate) {
        // Calcular dias de inatividade
        const daysInactive = lastSession
          ? Math.floor(
              (Date.now() - lastSession.createdAt.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : Math.floor(
              (Date.now() - client.createdAt.getTime()) / (1000 * 60 * 60 * 24),
            );

        // Contar usuários totais e inativos
        const totalUsers = userClients.length;
        const inactiveUsers = totalUsers; // Se não há sessões recentes, todos estão inativos

        inactiveClients.push({
          clientId: client.id,
          clientName:
            client.razaoSocial || client.nomeComercial || 'Cliente sem nome',
          daysInactive,
          totalUsers,
          inactiveUsers,
        });
      }
    }

    return {
      data: inactiveClients,
      total: inactiveClients.length,
    };
  }

  async generateInactivityNotifications(): Promise<void> {
    const inactiveClients = await this.findClientsWithoutRecentSessions(30);

    for (const client of inactiveClients.data) {
      // Verificar se já existe uma notificação para este cliente nos últimos 7 dias
      const existingNotification = await this.notificationsService.findMany({
        type: 'client_inactive',
        page: 1,
        limit: 1,
      });

      const hasRecentNotification = existingNotification.data.some(
        (notification) => {
          const notificationDate = new Date(notification.createdAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return (
            notificationDate > sevenDaysAgo &&
            notification.metadata?.clientId === client.clientId
          );
        },
      );

      if (!hasRecentNotification) {
        await this.notificationsService.createClientInactiveNotification(
          client.clientId,
          client.clientName,
          client.daysInactive,
        );
      }
    }
  }
}
