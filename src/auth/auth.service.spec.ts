import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnprocessableEntityException } from '@nestjs/common';
import { AuthProvidersEnum } from './auth-providers.enum';

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
  compare: jest.fn(),
}));

describe('AuthService - validateLogin', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  } as unknown as UsersService;
  const sessionServiceMock = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteByUserId: jest.fn(),
    deleteByUserIdWithExclude: jest.fn(),
    deleteById: jest.fn(),
  } as unknown as SessionService;
  const mailServiceMock = {
    userSignUp: jest.fn(),
  } as unknown as MailService;
  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const configServiceMock = {
    getOrThrow: jest.fn().mockReturnValue('15m'),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: MailService, useValue: mailServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw when user not found', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.validateLogin({ email: 'a@a.com', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when provider is not email', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      provider: AuthProvidersEnum.google,
    });

    await expect(
      service.validateLogin({ email: 'a@a.com', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when user has no password', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      provider: AuthProvidersEnum.email,
      password: null,
    });

    await expect(
      service.validateLogin({ email: 'a@a.com', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should throw when password is invalid', async () => {
    const bcrypt = require('bcryptjs');
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      provider: AuthProvidersEnum.email,
      password: 'hashed',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.validateLogin({ email: 'a@a.com', password: 'x' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should return tokens and user on success', async () => {
    const bcrypt = require('bcryptjs');
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      role: { id: 1 },
      provider: AuthProvidersEnum.email,
      password: 'hashed',
    });
    if (bcrypt.compare && typeof bcrypt.compare === 'function') {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    }
    if (bcrypt.default && typeof bcrypt.default.compare === 'function') {
      (bcrypt.default.compare as jest.Mock).mockResolvedValue(true);
    }
    (sessionServiceMock.create as jest.Mock).mockResolvedValue({ id: 10 });
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('jwt');
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      if (key === 'auth.expires') return '15m';
      if (key === 'auth.secret') return 'secret';
      if (key === 'auth.refreshSecret') return 'refresh';
      if (key === 'auth.refreshExpires') return '30d';
      return 'x';
    });

    const res = await service.validateLogin({ email: 'a@a.com', password: 'x' } as any);
    expect(res.token).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.tokenExpires).toBeDefined();
    expect(res.user).toBeDefined();
  });
});


