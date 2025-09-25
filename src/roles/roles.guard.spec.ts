import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new RolesGuard(reflector);

  const contextMock = (roles: number[] | undefined, userRoleId?: number) => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(roles);
    return {
      getClass: () => ({}),
      getHandler: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: { id: userRoleId } } }),
      }),
    } as any;
  };

  it('should allow when no roles metadata', () => {
    const ctx = contextMock([] as any);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow when user role is included', () => {
    const ctx = contextMock([1, 2, 3], 2);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny when user role not included', () => {
    const ctx = contextMock([1, 2, 3], 4);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});


