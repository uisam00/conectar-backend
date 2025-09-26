import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { FilesService } from '../files/files.service';
import { UnprocessableEntityException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findManyWithPagination: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as UserRepository;

  const filesServiceMock = {
    findById: jest.fn(),
  } as unknown as FilesService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: usersRepositoryMock },
        { provide: FilesService, useValue: filesServiceMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should throw when email already exists', async () => {
    (usersRepositoryMock.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

    await expect(
      service.create({
        email: 'john@example.com',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
      } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when photo does not exist', async () => {
    (usersRepositoryMock.findByEmail as jest.Mock).mockResolvedValue(null);
    (filesServiceMock.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({
        email: 'john@example.com',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
        photo: { id: 'uuid' },
      } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when role does not exist', async () => {
    (usersRepositoryMock.findByEmail as jest.Mock).mockResolvedValue(null);
    (filesServiceMock.findById as jest.Mock).mockResolvedValue(undefined);

    await expect(
      service.create({
        email: 'john@example.com',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
        role: { id: 9999 },
      } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when status does not exist', async () => {
    (usersRepositoryMock.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.create({
        email: 'john@example.com',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
        status: { id: 9999 },
      } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should create user successfully', async () => {
    (usersRepositoryMock.findByEmail as jest.Mock).mockResolvedValue(null);
    (usersRepositoryMock.create as jest.Mock).mockResolvedValue({ id: 1 });

    const created = await service.create({
      email: 'john@example.com',
      password: 'secret',
      firstName: 'John',
      lastName: 'Doe',
    } as any);

    expect(created).toEqual({ id: 1 });
    expect(usersRepositoryMock.create).toHaveBeenCalled();
  });
});
