import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { ClientInactivityService } from './services/client-inactivity.service';

@ApiTags('notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly clientInactivityService: ClientInactivityService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Criar notificação (apenas admin)' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de notificações' })
  async findMany(@Query() queryDto: QueryNotificationDto, @Request() req) {
    // Para usuários normais, filtrar apenas suas notificações
    if (req.user.role.name.toLowerCase() !== 'admin') {
      queryDto.userId = req.user.id;
    }

    return this.notificationsService.findMany(queryDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter contagem de notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Contagem de notificações não lidas',
  })
  async getUnreadCount(@Request() req) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.id),
    };
  }

  @Get('admin/clients-inactive')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Listar clientes inativos (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes sem sessão nos últimos 30 dias',
  })
  async getInactiveClients() {
    return await this.clientInactivityService.findClientsWithoutRecentSessions(
      30,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter notificação por ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findById(+id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({
    status: 200,
    description: 'Todas as notificações marcadas como lidas',
  })
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir notificação' })
  @ApiResponse({ status: 200, description: 'Notificação excluída' })
  remove(@Param('id') id: string) {
    return this.notificationsService.delete(+id);
  }
}
