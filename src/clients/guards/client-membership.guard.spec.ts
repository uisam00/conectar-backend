import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ClientMembershipGuard } from './client-membership.guard';
import { Repository } from 'typeorm';
import { UserClientEntity } from '../../users/infrastructure/persistence/relational/entities/user-client.entity';

describe('ClientMembershipGuard', () => {
  let guard: ClientMembershipGuard;
  let userClientRepository: jest.Mocked<Repository<UserClientEntity>>;

  const mockUserClientRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientMembershipGuard,
        {
          provide: 'UserClientEntityRepository',
          useValue: mockUserClientRepository,
        },
      ],
    }).compile();

    guard = module.get<ClientMembershipGuard>(ClientMembershipGuard);
    userClientRepository = module.get('UserClientEntityRepository');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { id: '1' },
          }),
        }),
      } as any;
    });

    it('should return true when user belongs to client', async () => {
      const mockUserClient = { userId: 1, clientId: 1 };
      userClientRepository.findOne.mockResolvedValue(mockUserClient as any);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(userClientRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          clientId: 1,
        },
      });
    });

    it('should throw ForbiddenException when user does not belong to client', async () => {
      userClientRepository.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(userClientRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          clientId: 1,
        },
      });
    });

    it('should throw ForbiddenException when user is not found in request', async () => {
      const contextWithoutUser = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            params: { id: '1' },
          }),
        }),
      } as any;

      await expect(guard.canActivate(contextWithoutUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when client ID is not found in request', async () => {
      const contextWithoutClientId = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: {},
          }),
        }),
      } as any;

      await expect(guard.canActivate(contextWithoutClientId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle string client ID correctly', async () => {
      const contextWithStringId = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { id: '123' },
          }),
        }),
      } as any;

      const mockUserClient = { userId: 1, clientId: 123 };
      userClientRepository.findOne.mockResolvedValue(mockUserClient as any);

      const result = await guard.canActivate(contextWithStringId);

      expect(result).toBe(true);
      expect(userClientRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          clientId: 123,
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      userClientRepository.findOne.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        Error,
      );
    });
  });
});
