import 'reflect-metadata';
import validateConfig from './validate-config';
import { IsInt } from 'class-validator';

class Env {
  @IsInt()
  PORT: number;
}

describe('validateConfig', () => {
  it('should pass with valid config', () => {
    const env = validateConfig({ PORT: 3000 }, Env);
    expect(env).toBeDefined();
    expect((env as any).PORT).toBe(3000);
  });

  it('should throw with invalid config', () => {
    expect(() => validateConfig({ PORT: 'abc' } as any, Env)).toThrow();
  });
});


