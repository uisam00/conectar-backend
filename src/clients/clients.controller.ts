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

@ApiTags('Clients')
@ApiBearerAuth()
@Controller({
  path: 'clients',
  version: '1',
})
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create a new client (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  create(@Body() createClientDto: CreateClientDto): Promise<ClientDto> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'Clients retrieved successfully' })
  findAll(@Query() queryDto: QueryClientDto) {
    return this.clientsService.findMany(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by id' })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully',
    type: ClientDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update client (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete client (Admin only)' })
  @ApiResponse({ status: 204, description: 'Client deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.delete(id);
  }
}
