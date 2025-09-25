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

describe('AuthService - register & confirmEmail', () => {
  let service: AuthService;
  const usersServiceMock = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersService;
  const sessionServiceMock = {
    create: jest.fn(),
    deleteById: jest.fn(),
  } as unknown as SessionService;
  const mailServiceMock = {
    userSignUp: jest.fn(),
    confirmNewEmail: jest.fn(),
  } as unknown as MailService;
  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const configServiceMock = {
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      const map = {
        'auth.confirmEmailSecret': 'secret_confirm',
        'auth.confirmEmailExpires': '1d',
      } as Record<string, string>;
      return map[key] ?? 'x';
    });

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

  it('register should create user, sign confirm hash and send email', async () => {
    (usersServiceMock.create as jest.Mock).mockResolvedValue({ id: 123 });
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('hash123');

    await service.register({
      email: 'john@example.com',
      password: 'secret',
      firstName: 'John',
      lastName: 'Doe',
    } as any);

    expect(usersServiceMock.create).toHaveBeenCalled();
    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
    expect(mailServiceMock.userSignUp).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'john@example.com' }),
    );
  });

  it('confirmEmail should throw on invalid hash', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad'));

    await expect(service.confirmEmail('invalid')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('confirmEmail should throw not found when user missing or not inactive', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockResolvedValue({ confirmEmailUserId: 1 });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, status: { id: 999 } });

    await expect(service.confirmEmail('ok')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('confirmEmail should activate user and update', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockResolvedValue({ confirmEmailUserId: 1 });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, status: { id: require('../statuses/statuses.enum').StatusEnum.inactive } });
    (usersServiceMock.update as jest.Mock).mockResolvedValue(undefined);

    await service.confirmEmail('ok');

    expect(usersServiceMock.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: { id: expect.any(Number) } }),
    );
  });
});

describe('AuthService - forgotPassword & resetPassword', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersService;
  const sessionServiceMock = {
    deleteByUserId: jest.fn(),
  } as unknown as SessionService;
  const mailServiceMock = {
    forgotPassword: jest.fn(),
  } as unknown as MailService;
  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;
  const configServiceMock = {
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      const map = {
        'auth.forgotExpires': '30m',
        'auth.forgotSecret': 'forgot_secret',
      } as Record<string, string>;
      return map[key] ?? 'x';
    });

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

  it('forgotPassword should fail when email not exists', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(service.forgotPassword('john@example.com')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('forgotPassword should sign token and send mail', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('hash');

    await service.forgotPassword('john@example.com');

    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
    expect(mailServiceMock.forgotPassword).toHaveBeenCalled();
  });

  it('resetPassword should fail for invalid hash', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad'));
    await expect(service.resetPassword('invalid', 'newpass')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('resetPassword should fail when user not found', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockResolvedValue({ forgotUserId: 1 });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.resetPassword('ok', 'newpass')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('resetPassword should update user and revoke sessions', async () => {
    (jwtServiceMock.verifyAsync as jest.Mock).mockResolvedValue({ forgotUserId: 1 });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1 });
    (usersServiceMock.update as jest.Mock).mockResolvedValue(undefined);

    await service.resetPassword('ok', 'newpass');

    expect(sessionServiceMock.deleteByUserId).toHaveBeenCalledWith({ userId: 1 });
    expect(usersServiceMock.update).toHaveBeenCalledWith(1, expect.objectContaining({ password: 'newpass' }));
  });
});

describe('AuthService - update, refreshToken e logout', () => {
  let service: AuthService;
  const usersServiceMock = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  } as unknown as UsersService;
  const sessionServiceMock = {
    deleteByUserIdWithExclude: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  } as unknown as SessionService;
  const mailServiceMock = {
    confirmNewEmail: jest.fn(),
  } as unknown as MailService;
  const jwtServiceMock = {
    signAsync: jest.fn(),
  } as unknown as JwtService;
  const configServiceMock = {
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(async () => {
    jest.resetAllMocks();
    (configServiceMock.getOrThrow as jest.Mock).mockImplementation((key: string) => {
      const map = {
        'auth.confirmEmailSecret': 'confirm',
        'auth.confirmEmailExpires': '1d',
        'auth.expires': '15m',
        'auth.secret': 's',
        'auth.refreshSecret': 'rs',
        'auth.refreshExpires': '30d',
      } as Record<string, string>;
      return map[key] ?? 'x';
    });

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

  it('update should throw when current user not found', async () => {
    (usersServiceMock.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      service.update({ id: 1 } as any, {} as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('update should throw when password provided without oldPassword', async () => {
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1 });
    await expect(
      service.update({ id: 1 } as any, { password: 'new' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('update should throw when oldPassword incorrect', async () => {
    const bcrypt = require('bcryptjs');
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, password: 'hashed' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.update({ id: 1 } as any, { password: 'new', oldPassword: 'old' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('update should throw when email already exists for another user', async () => {
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, email: 'a@a.com' });
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue({ id: 2 });
    await expect(
      service.update({ id: 1 } as any, { email: 'b@b.com' } as any),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('update should send confirmNewEmail when changing email', async () => {
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, email: 'a@a.com', password: 'h' });
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('hash');
    await service.update({ id: 1, sessionId: 10 } as any, { email: 'b@b.com', oldPassword: undefined } as any);
    expect(mailServiceMock.confirmNewEmail).toHaveBeenCalled();
  });

  it('refreshToken should throw when session not found', async () => {
    (sessionServiceMock.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      service.refreshToken({ sessionId: 1, hash: 'x' } as any),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('refreshToken should throw when hash mismatch', async () => {
    (sessionServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, hash: 'a', user: { id: 1 } });
    await expect(
      service.refreshToken({ sessionId: 1, hash: 'b' } as any),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('refreshToken should throw when user has no role', async () => {
    (sessionServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, hash: 'a', user: { id: 1 } });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, role: null });
    await expect(
      service.refreshToken({ sessionId: 1, hash: 'a' } as any),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('refreshToken should return tokens on success', async () => {
    (sessionServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, hash: 'a', user: { id: 1 } });
    (usersServiceMock.findById as jest.Mock).mockResolvedValue({ id: 1, role: { id: 1 } });
    (sessionServiceMock.update as jest.Mock).mockResolvedValue(undefined);
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('jwt');
    const res = await service.refreshToken({ sessionId: 1, hash: 'a' } as any);
    expect(res.token).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.tokenExpires).toBeDefined();
  });

  it('logout should delete session by id', async () => {
    (sessionServiceMock.deleteById as jest.Mock).mockResolvedValue(undefined);
    await service.logout({ sessionId: 5 } as any);
    expect(sessionServiceMock.deleteById).toHaveBeenCalledWith(5);
  });
});


