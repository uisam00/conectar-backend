import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PlanRepository } from './infrastructure/persistence/plan.repository';
import { Plan } from './domain/plan';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { QueryPlanDto } from './dto/query-plan.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Reflector } from '@nestjs/core';

describe('PlansService', () => {
  let service: PlansService;
  let controller: PlansController;
  let planRepository: jest.Mocked<PlanRepository>;

  const mockPlan: Plan = {
    id: 1,
    name: 'Plano Básico',
    description: 'Plano ideal para pequenas empresas',
    price: 99.90,
    features: {
      maxUsers: 10,
      maxStorage: '1GB',
      features: ['email', 'support']
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlanRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        PlansService,
        {
          provide: PlanRepository,
          useValue: mockPlanRepository,
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

    service = module.get<PlansService>(PlansService);
    controller = module.get<PlansController>(PlansController);
    planRepository = module.get(PlanRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new plan', async () => {
      const createPlanDto: CreatePlanDto = {
        name: 'Plano Básico',
        description: 'Plano ideal para pequenas empresas',
        price: 99.90,
        features: {
          maxUsers: 10,
          maxStorage: '1GB',
          features: ['email', 'support']
        },
      };

      planRepository.create.mockResolvedValue(mockPlan);

      const result = await service.create(createPlanDto);

      expect(planRepository.create).toHaveBeenCalledWith(createPlanDto);
      expect(result).toEqual(mockPlan);
    });
  });

  describe('findMany', () => {
    it('should return paginated plans', async () => {
      const queryDto: QueryPlanDto = {
        search: 'básico',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [mockPlan],
        total: 1,
      };

      planRepository.findMany.mockResolvedValue(mockResult);

      const result = await service.findMany(queryDto);

      expect(planRepository.findMany).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('should return a plan by id', async () => {
      const id = 1;
      planRepository.findById.mockResolvedValue(mockPlan);

      const result = await service.findById(id);

      expect(planRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPlan);
    });

    it('should return null if plan not found', async () => {
      const id = 999;
      planRepository.findById.mockResolvedValue(null);

      const result = await service.findById(id);

      expect(planRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a plan', async () => {
      const id = 1;
      const updatePlanDto: UpdatePlanDto = {
        name: 'Plano Básico Atualizado',
        price: 149.90,
      };

      const updatedPlan = { ...mockPlan, ...updatePlanDto };
      planRepository.update.mockResolvedValue(updatedPlan);

      const result = await service.update(id, updatePlanDto);

      expect(planRepository.update).toHaveBeenCalledWith(id, updatePlanDto);
      expect(result).toEqual(updatedPlan);
    });
  });

  describe('delete', () => {
    it('should delete a plan', async () => {
      const id = 1;
      planRepository.delete.mockResolvedValue();

      await service.delete(id);

      expect(planRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('Controller Authorization', () => {
    it('should have admin protection on create endpoint', () => {
      const createMetadata = Reflect.getMetadata('roles', PlansController.prototype.create);
      expect(createMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on update endpoint', () => {
      const updateMetadata = Reflect.getMetadata('roles', PlansController.prototype.update);
      expect(updateMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should have admin protection on delete endpoint', () => {
      const deleteMetadata = Reflect.getMetadata('roles', PlansController.prototype.remove);
      expect(deleteMetadata).toEqual([1]); // RoleEnum.admin = 1
    });

    it('should allow public access to read endpoints', () => {
      const findAllMetadata = Reflect.getMetadata('roles', PlansController.prototype.findAll);
      const findOneMetadata = Reflect.getMetadata('roles', PlansController.prototype.findOne);
      
      expect(findAllMetadata).toBeUndefined();
      expect(findOneMetadata).toBeUndefined();
    });
  });
});
