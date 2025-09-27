import { CnpjVO } from './cnpj.vo';

describe('CnpjVO', () => {
  describe('constructor', () => {
    it('should create a valid CNPJ with formatted input', () => {
      const cnpj = new CnpjVO('25.071.829/0001-06');
      expect(cnpj.getValue()).toBe('25.071.829/0001-06');
      expect(cnpj.getNumbers()).toBe('25071829000106');
    });

    it('should create a valid CNPJ with unformatted input', () => {
      const cnpj = new CnpjVO('62613590000185');
      expect(cnpj.getValue()).toBe('62.613.590/0001-85');
      expect(cnpj.getNumbers()).toBe('62613590000185');
    });

    it('should throw error for invalid CNPJ format', () => {
      expect(() => new CnpjVO('123')).toThrow(
        'CNPJ deve ter exatamente 14 dígitos',
      );
    });

    it('should throw error for CNPJ with all same digits', () => {
      expect(() => new CnpjVO('11111111111111')).toThrow(
        'CNPJ não pode ter todos os dígitos iguais',
      );
    });

    it('should throw error for invalid CNPJ checksum', () => {
      expect(() => new CnpjVO('11.222.333/0001-82')).toThrow('CNPJ inválido');
    });

    it('should accept valid CNPJ with different formats', () => {
      const validCnpjs = [
        '11.222.333/0001-81',
        '11222333000181',
        '11.222.333/0001-81',
      ];

      validCnpjs.forEach((cnpjStr) => {
        expect(() => new CnpjVO(cnpjStr)).not.toThrow();
      });
    });
  });

  describe('getValue', () => {
    it('should return formatted CNPJ', () => {
      const cnpj = new CnpjVO('11222333000181');
      expect(cnpj.getValue()).toBe('11.222.333/0001-81');
    });
  });

  describe('getNumbers', () => {
    it('should return only numbers', () => {
      const cnpj = new CnpjVO('11.222.333/0001-81');
      expect(cnpj.getNumbers()).toBe('11222333000181');
    });
  });

  describe('equals', () => {
    it('should return true for same CNPJ', () => {
      const cnpj1 = new CnpjVO('25.071.829/0001-06');
      const cnpj2 = new CnpjVO('25071829000106');
      expect(cnpj1.equals(cnpj2)).toBe(true);
    });

    it('should return false for different CNPJ', () => {
      const cnpj1 = new CnpjVO('25.071.829/0001-06');
      const cnpj2 = new CnpjVO('40.605.574/0001-08');
      expect(cnpj1.equals(cnpj2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted CNPJ', () => {
      const cnpj = new CnpjVO('62613590000185');
      expect(cnpj.toString()).toBe('62.613.590/0001-85');
    });
  });

  describe('real world examples', () => {
    it('should validate real CNPJs', () => {
      // CNPJs válidos reais fornecidos pelo usuário
      const validCnpjs = [
        '25.071.829/0001-06',
        '40.605.574/0001-08',
        '00.624.632/0001-26',
        '68.493.739/0001-16',
        '86.858.798/0001-22',
      ];

      validCnpjs.forEach((cnpjStr) => {
        expect(() => new CnpjVO(cnpjStr)).not.toThrow();
      });
    });

    it('should validate various CNPJ formats', () => {
      // Testar diferentes formatos de CNPJ válidos
      const validCnpjs = [
        '25.071.829/0001-06',
        '25071829000106',
        '62613590000185',
      ];

      validCnpjs.forEach((cnpjStr) => {
        expect(() => new CnpjVO(cnpjStr)).not.toThrow();
      });
    });

    it('should reject obviously invalid CNPJs', () => {
      const invalidCnpjs = [
        '00.000.000/0000-00',
        '11.111.111/1111-11',
        '12.345.678/0001-99', // Dígito verificador inválido
        '12345678901234', // Muito longo
        '1234567890123', // Muito curto
      ];

      invalidCnpjs.forEach((cnpjStr) => {
        expect(() => new CnpjVO(cnpjStr)).toThrow();
      });
    });
  });
});
