import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { SessionRepository } from './infrastructure/persistence/session.repository';

describe('SessionService', () => {
  let service: SessionService;

  const sessionRepositoryMock = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    deleteByUserId: jest.fn(),
    deleteByUserIdWithExclude: jest.fn(),
  } as unknown as SessionRepository;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: SessionRepository, useValue: sessionRepositoryMock },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should proxy findById', async () => {
    (sessionRepositoryMock.findById as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await service.findById(1 as any);
    expect(res).toEqual({ id: 1 });
  });

  it('should proxy create', async () => {
    (sessionRepositoryMock.create as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await service.create({ user: { id: 1 }, hash: 'x' } as any);
    expect(res).toEqual({ id: 1 });
  });

  it('should proxy update', async () => {
    (sessionRepositoryMock.update as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await service.update(1 as any, { hash: 'y' } as any);
    expect(res).toEqual({ id: 1 });
  });

  it('should proxy deleteById', async () => {
    (sessionRepositoryMock.deleteById as jest.Mock).mockResolvedValue(
      undefined,
    );
    await service.deleteById(1 as any);
    expect(sessionRepositoryMock.deleteById).toHaveBeenCalledWith(1);
  });

  it('should proxy deleteByUserId', async () => {
    (sessionRepositoryMock.deleteByUserId as jest.Mock).mockResolvedValue(
      undefined,
    );
    await service.deleteByUserId({ userId: 1 } as any);
    expect(sessionRepositoryMock.deleteByUserId).toHaveBeenCalledWith({
      userId: 1,
    });
  });

  it('should proxy deleteByUserIdWithExclude', async () => {
    (
      sessionRepositoryMock.deleteByUserIdWithExclude as jest.Mock
    ).mockResolvedValue(undefined);
    await service.deleteByUserIdWithExclude({
      userId: 1,
      excludeSessionId: 2,
    } as any);
    expect(
      sessionRepositoryMock.deleteByUserIdWithExclude,
    ).toHaveBeenCalledWith({ userId: 1, excludeSessionId: 2 });
  });
});
