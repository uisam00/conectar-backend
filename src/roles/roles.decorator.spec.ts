import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('should set metadata "roles" with provided values', () => {
    class Test {}
    Roles(1, 2, 3)(Test as any);
    const reflector = new Reflector();
    const val = reflector.get<number[]>('roles', Test);
    expect(val).toEqual([1, 2, 3]);
  });
});
