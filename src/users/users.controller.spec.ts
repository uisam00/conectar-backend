import 'reflect-metadata';
jest.mock('src/utils/validate-config', () => ({
  __esModule: true,
  default: () => undefined,
}), { virtual: true });

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const serviceMock = {
    create: jest.fn(),
    findManyWithPagination: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as UsersService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('create should delegate to service', async () => {
    (serviceMock.create as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await controller.create({} as any);
    expect(serviceMock.create).toHaveBeenCalled();
    expect(res).toEqual({ id: 1 });
  });

  it('findAll should paginate and delegate to service', async () => {
    (serviceMock.findManyWithPagination as jest.Mock).mockResolvedValue([]);
    const res = await controller.findAll({ page: 2, limit: 200 } as any);
    expect(serviceMock.findManyWithPagination).toHaveBeenCalledWith({
      filterOptions: undefined,
      sortOptions: undefined,
      paginationOptions: { page: 2, limit: 50 },
    });
    expect(res).toHaveProperty('data');
    expect(Array.isArray((res as any).data)).toBe(true);
  });

  it('findOne should delegate to service', async () => {
    (serviceMock.findById as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await controller.findOne(1 as any);
    expect(serviceMock.findById).toHaveBeenCalledWith(1);
    expect(res).toEqual({ id: 1 });
  });

  it('update should delegate to service', async () => {
    (serviceMock.update as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await controller.update(1 as any, {} as any);
    expect(serviceMock.update).toHaveBeenCalledWith(1, {});
    expect(res).toEqual({ id: 1 });
  });

  it('remove should delegate to service', async () => {
    await controller.remove(1 as any);
    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});


