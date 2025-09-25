import 'reflect-metadata';
jest.mock('src/utils/validate-config', () => ({
  __esModule: true,
  default: () => undefined,
}), { virtual: true });
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const serviceMock = {
    validateLogin: jest.fn(),
    register: jest.fn(),
    confirmEmail: jest.fn(),
    confirmNewEmail: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    me: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  } as unknown as AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('login should delegate to service', async () => {
    (serviceMock.validateLogin as jest.Mock).mockResolvedValue({ token: 't' });
    const res = await controller.login({} as any);
    expect(serviceMock.validateLogin).toHaveBeenCalled();
    expect(res).toEqual({ token: 't' });
  });

  it('register should delegate to service', async () => {
    await controller.register({} as any);
    expect(serviceMock.register).toHaveBeenCalled();
  });

  it('confirmEmail should delegate to service', async () => {
    await controller.confirmEmail({ hash: 'h' } as any);
    expect(serviceMock.confirmEmail).toHaveBeenCalledWith('h');
  });

  it('confirmNewEmail should delegate to service', async () => {
    await controller.confirmNewEmail({ hash: 'h' } as any);
    expect(serviceMock.confirmNewEmail).toHaveBeenCalledWith('h');
  });

  it('forgotPassword should delegate to service', async () => {
    await controller.forgotPassword({ email: 'a@a.com' } as any);
    expect(serviceMock.forgotPassword).toHaveBeenCalledWith('a@a.com');
  });

  it('resetPassword should delegate to service', async () => {
    await controller.resetPassword({ hash: 'h', password: 'p' } as any);
    expect(serviceMock.resetPassword).toHaveBeenCalledWith('h', 'p');
  });

  it('me should delegate to service', async () => {
    (serviceMock.me as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await controller.me({ user: { id: 1 } } as any);
    expect(serviceMock.me).toHaveBeenCalledWith({ id: 1 });
    expect(res).toEqual({ id: 1 });
  });

  it('refresh should delegate to service', async () => {
    (serviceMock.refreshToken as jest.Mock).mockResolvedValue({ token: 't' });
    const res = await controller.refresh({ user: { sessionId: 1, hash: 'h' } } as any);
    expect(serviceMock.refreshToken).toHaveBeenCalledWith({ sessionId: 1, hash: 'h' });
    expect(res).toEqual({ token: 't' });
  });

  it('logout should delegate to service', async () => {
    await controller.logout({ user: { sessionId: 1 } } as any);
    expect(serviceMock.logout).toHaveBeenCalledWith({ sessionId: 1 });
  });

  it('update should delegate to service', async () => {
    (serviceMock.update as jest.Mock).mockResolvedValue({ id: 1 });
    const res = await controller.update({ user: { id: 1 } } as any, {} as any);
    expect(serviceMock.update).toHaveBeenCalled();
    expect(res).toEqual({ id: 1 });
  });

  it('delete should delegate to service', async () => {
    await controller.delete({ user: { id: 1 } } as any);
    expect(serviceMock.softDelete).toHaveBeenCalledWith({ id: 1 });
  });
});


