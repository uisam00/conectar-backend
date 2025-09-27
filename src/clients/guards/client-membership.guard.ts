import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserClientEntity } from '../../users/infrastructure/persistence/relational/entities/user-client.entity';

@Injectable()
export class ClientMembershipGuard implements CanActivate {
  constructor(
    @InjectRepository(UserClientEntity)
    private readonly userClientRepository: Repository<UserClientEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const clientId = parseInt(request.params.id);

    if (!user || !clientId) {
      throw new ForbiddenException('User or client ID not found');
    }

    // Verificar se o usuário pertence ao cliente
    const userClient = await this.userClientRepository.findOne({
      where: {
        userId: user.id,
        clientId: clientId,
      },
    });

    if (!userClient) {
      throw new ForbiddenException('User does not belong to this client');
    }

    return true;
  }
}
