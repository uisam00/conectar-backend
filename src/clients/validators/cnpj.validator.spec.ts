import { IsValidCnpjConstraint } from './cnpj.validator';

describe('IsValidCnpjConstraint', () => {
  let constraint: IsValidCnpjConstraint;
  beforeEach(() => {
    constraint = new IsValidCnpjConstraint();
  });

  describe('validate', () => {
    it('should return true for valid CNPJ', () => {
      const validCnpjs = [
        '25.071.829/0001-06',
        '25071829000106',
        '62613590000185',
      ];

      validCnpjs.forEach((cnpj) => {
        const result = constraint.validate(cnpj);
        expect(result).toBe(true);
      });
    });

    it('should return false for invalid CNPJ', () => {
      const invalidCnpjs = [
        '123',
        '11.111.111/1111-11',
        '00.000.000/0000-00',
        '12.345.678/0001-99',
        '',
      ];

      invalidCnpjs.forEach((cnpj) => {
        const result = constraint.validate(cnpj);
        expect(result).toBe(false);
      });
    });

    it('should return false for empty string', () => {
      const result = constraint.validate('');
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = constraint.validate(null);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = constraint.validate(undefined);
      expect(result).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      const message = constraint.defaultMessage();
      expect(message).toBe('CNPJ inválido');
    });
  });
});
