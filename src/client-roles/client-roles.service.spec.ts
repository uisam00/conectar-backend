import { Test, TestingModule } from '@nestjs/testing';
import { ClientRolesService } from './client-roles.service';
import { ClientRolesController } from './client-roles.controller';
import { ClientRoleRepository } from './infrastructure/persistence/client-role.repository';
import { ClientRole } from './domain/client-role';
import { CreateClientRoleDto } from './dto/create-client-role.dto';
import { UpdateClientRoleDto } from './dto/update-client-role.dto';
import { QueryClientRoleDto } from './dto/query-client-role.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Reflector } from '@nestjs/core';

describe('ClientRolesService', () => {
  let service: ClientRolesService;
  let controller: ClientRolesController;
  let clientRoleRepository: jest.Mocked<ClientRoleRepository>;

  const mockClientRole: ClientRole = {
    id: 1,
    name: 'client_admin',
    description: 'Administrador do cliente',
    permissions: {
      canManageUsers: true,
      canManageClient: true,
      canViewReports: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientRoleRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientRolesController],
      providers: [
        ClientRolesService,
        {
          provide: ClientRoleRepository,
          useValue: mockClientRoleRepository,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    service = module.get<ClientRolesService>(ClientRolesService);
    controller = module.get<ClientRolesController>(ClientRolesController);
    clientRoleRepository = module.get(ClientRoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client role', async () => {
      const createClientRoleDto: CreateClientRoleDto = {
        name: 'client_admin',
        description: 'Administrador do cliente',
        permissions: {
          canManageUsers: true,
          canManageClient: true,
          canViewReports: true,
        },
      };

      clientRoleRepository.create.mockResolvedValue(mockClientRole);

      const result = await service.create(createClientRoleDto);

      expect(clientRoleRepository.create).toHaveBeenCalledWith(
        createClientRoleDto,
      );
      expect(result).toEqual(mockClientRole);
    });
  });

  describe('findMany', () => {
    it('should return paginated client roles', async () => {
      const queryDto: QueryClientRoleDto = {
        search: 'admin',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [mockClientRole],
        total: 1,
      };

      clientRoleRepository.findMany.mockResolvedValue(mockResult);

      const result = await service.findMany(queryDto);

      expect(clientRoleRepository.findMany).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('should return a client role by id', async () => {
      const id = 1;
      clientRoleRepository.findById.mockResolvedValue(mockClientRole);

      const result = await service.findById(id);

      expect(clientRoleRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockClientRole);
    });

    it('should return null if client role not found', async () => {
      const id = 999;
      clientRoleRepository.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(clientRoleRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client role', async () => {
      const id = 1;
      const updateClientRoleDto: UpdateClientRoleDto = {
        description: 'Administrador do cliente atualizado',
      };

      const updatedClientRole = { ...mockClientRole, ...updateClientRoleDto };
      clientRoleRepository.update.mockResolvedValue(updatedClientRole);

      const result = await service.update(id, updateClientRoleDto);

      expect(clientRoleRepository.update).toHaveBeenCalledWith(
        id,
        updateClientRoleDto,
      );
      expect(result).toEqual(updatedClientRole);
    });
  });

  describe('delete', () => {
    it('should delete a client role', async () => {
      const id = 1;
      clientRoleRepository.delete.mockResolvedValue();

      await service.delete(id);

      expect(clientRoleRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('Controller Authorization', () => {
    it('should have admin protection on create endpoint', () => {
      const createMetadata = Reflect.getMetadata(
        'roles',
        ClientRolesController.prototype.create,
      );
      expect(createMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on update endpoint', () => {
      const updateMetadata = Reflect.getMetadata(
        'roles',
        ClientRolesController.prototype.update,
      );
      expect(updateMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on delete endpoint', () => {
      const deleteMetadata = Reflect.getMetadata(
        'roles',
        ClientRolesController.prototype.remove,
      );
      expect(deleteMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should allow public access to read endpoints', () => {
      const findAllMetadata = Reflect.getMetadata(
        'roles',
        ClientRolesController.prototype.findAll,
      );
      const findOneMetadata = Reflect.getMetadata(
        'roles',
        ClientRolesController.prototype.findOne,
      );

      expect(findAllMetadata).toBeUndefined();
      expect(findOneMetadata).toBeUndefined();
    });
  });
});
