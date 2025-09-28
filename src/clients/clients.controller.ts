import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { ClientDto } from './dto/client.dto';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { ClientMembershipGuard } from './guards/client-membership.guard';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { User } from '../users/domain/user';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller({
  path: 'clients',
  version: '1',
})
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create a new client (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or CNPJ format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - CNPJ already exists',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity - CNPJ validation failed',
  })
  create(@Body() createClientDto: CreateClientDto): Promise<ClientDto> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({
    summary: 'Get all clients (Admin only)',
    description:
      'Retrieve clients with optional filters for name, status, plan, and special plans. Supports pagination and search functionality.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clients retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ClientDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  findAll(@Query() queryDto: QueryClientDto) {
    return this.clientsService.findMany(queryDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), ClientMembershipGuard)
  @ApiOperation({ summary: 'Get client by id (Client members only)' })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid client ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User must be a member of this client',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update client (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or CNPJ format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - CNPJ already exists in another client',
  })
  @ApiResponse({
    status: 422,
    description: 'Unprocessable Entity - CNPJ validation failed',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete client (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Client deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid client ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.delete(id);
  }

  @Get(':id/users')
  @UseGuards(AuthGuard('jwt'), RolesGuard, ClientMembershipGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get users by client',
    description: 'Retrieve all users associated with a specific client',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: InfinityPaginationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid client ID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Admin access required or user does not belong to client',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async findUsersByClient(
    @Param('id', ParseIntPipe) clientId: number,
    @Query() query: QueryUserDto,
  ): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.clientsService.findUsersByClient(clientId, {
        search: query?.search,
        firstName: query?.firstName,
        lastName: query?.lastName,
        email: query?.email,
        roleId: query?.roleId,
        statusId: query?.statusId,
        systemRoleId: query?.systemRoleId,
        clientRoleId: query?.clientRoleId,
        sortBy: query?.sortBy,
        sortOrder: query?.sortOrder,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }
}
