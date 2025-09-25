import 'reflect-metadata';
import { validate } from 'class-validator';
import { Tokens } from './tokens';

describe('Tokens DTO', () => {
  it('should fail when token1 is empty', async () => {
    const dto = new Tokens();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass when token1 is provided', async () => {
    const dto = new Tokens();
    dto.token1 = 'abc';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});


