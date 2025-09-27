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
import { ClientRolesService } from './client-roles.service';
import { CreateClientRoleDto } from './dto/create-client-role.dto';
import { UpdateClientRoleDto } from './dto/update-client-role.dto';
import { QueryClientRoleDto } from './dto/query-client-role.dto';
import { ClientRoleDto } from './dto/client-role.dto';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Client Roles')
@ApiBearerAuth()
@Controller({
  path: 'client-roles',
  version: '1',
})
export class ClientRolesController {
  constructor(private readonly clientRolesService: ClientRolesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Create a new client role (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Client role created successfully',
    type: ClientRoleDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  create(
    @Body() createClientRoleDto: CreateClientRoleDto,
  ): Promise<ClientRoleDto> {
    return this.clientRolesService.create(createClientRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all client roles' })
  @ApiResponse({
    status: 200,
    description: 'Client roles retrieved successfully',
  })
  findAll(@Query() queryDto: QueryClientRoleDto) {
    return this.clientRolesService.findMany(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client role by id' })
  @ApiResponse({
    status: 200,
    description: 'Client role retrieved successfully',
    type: ClientRoleDto,
  })
  @ApiResponse({ status: 404, description: 'Client role not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientRolesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @ApiOperation({ summary: 'Update client role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Client role updated successfully',
    type: ClientRoleDto,
  })
  @ApiResponse({ status: 404, description: 'Client role not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientRoleDto: UpdateClientRoleDto,
  ) {
    return this.clientRolesService.update(id, updateClientRoleDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete client role (Admin only)' })
  @ApiResponse({ status: 204, description: 'Client role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Client role not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientRolesService.delete(id);
  }
}
