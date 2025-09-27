import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { ClientRepository } from './infrastructure/persistence/client.repository';
import { Client } from './domain/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Reflector } from '@nestjs/core';

describe('ClientsService', () => {
  let service: ClientsService;
  let controller: ClientsController;
  let clientRepository: jest.Mocked<ClientRepository>;

  const mockClient: Client = {
    id: 1,
    razaoSocial: 'Empresa ABC Ltda',
    cnpj: '12.345.678/0001-90',
    nomeComercial: 'ABC Comércio',
    statusId: 1,
    planId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        ClientsService,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: 'UserClientEntityRepository',
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard('ClientMembershipGuard')
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    service = module.get<ClientsService>(ClientsService);
    controller = module.get<ClientsController>(ClientsController);
    clientRepository = module.get(ClientRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto: CreateClientDto = {
        razaoSocial: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        nomeComercial: 'ABC Comércio',
        statusId: 1,
        planId: 1,
      };

      clientRepository.create.mockResolvedValue(mockClient);

      const result = await service.create(createClientDto);

      expect(clientRepository.create).toHaveBeenCalledWith(createClientDto);
      expect(result).toEqual(mockClient);
    });
  });

  describe('findMany', () => {
    it('should return paginated clients', async () => {
      const queryDto: QueryClientDto = {
        search: 'ABC',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [mockClient],
        total: 1,
      };

      clientRepository.findMany.mockResolvedValue(mockResult);

      const result = await service.findMany(queryDto);

      expect(clientRepository.findMany).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('should return a client by id', async () => {
      const id = 1;
      clientRepository.findById.mockResolvedValue(mockClient);

      const result = await service.findById(id);

      expect(clientRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockClient);
    });

    it('should return null if client not found', async () => {
      const id = 999;
      clientRepository.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(clientRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const id = 1;
      const updateClientDto: UpdateClientDto = {
        nomeComercial: 'ABC Comércio Atualizado',
      };

      const updatedClient = { ...mockClient, ...updateClientDto };
      clientRepository.update.mockResolvedValue(updatedClient);

      const result = await service.update(id, updateClientDto);

      expect(clientRepository.update).toHaveBeenCalledWith(id, updateClientDto);
      expect(result).toEqual(updatedClient);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      const id = 1;
      clientRepository.delete.mockResolvedValue();

      await service.delete(id);

      expect(clientRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('Controller Authorization', () => {
    it('should have admin protection on create endpoint', () => {
      const createMetadata = Reflect.getMetadata(
        'roles',
        ClientsController.prototype.create,
      );
      expect(createMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on update endpoint', () => {
      const updateMetadata = Reflect.getMetadata(
        'roles',
        ClientsController.prototype.update,
      );
      expect(updateMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on delete endpoint', () => {
      const deleteMetadata = Reflect.getMetadata(
        'roles',
        ClientsController.prototype.remove,
      );
      expect(deleteMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on findAll endpoint', () => {
      const findAllMetadata = Reflect.getMetadata(
        'roles',
        ClientsController.prototype.findAll,
      );
      expect(findAllMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have membership protection on findOne endpoint', () => {
      const findOneMetadata = Reflect.getMetadata(
        'roles',
        ClientsController.prototype.findOne,
      );
      expect(findOneMetadata).toBeUndefined(); // Uses ClientMembershipGuard instead of RolesGuard
    });
  });
});
