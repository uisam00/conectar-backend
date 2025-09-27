import { IsString, Matches, Length } from 'class-validator';

export class CnpjVO {
  @IsString()
  @Length(14, 18, { message: 'CNPJ deve ter entre 14 e 18 caracteres' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX',
  })
  private readonly value: string;

  constructor(cnpj: string) {
    this.value = this.sanitize(cnpj);
    this.validate();
  }

  private sanitize(cnpj: string): string {
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length === 14) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }

    return cnpj;
  }

  private validate(): void {
    const numbers = this.value.replace(/\D/g, '');

    if (numbers.length !== 14) {
      throw new Error('CNPJ deve ter exatamente 14 dígitos');
    }

    if (this.isAllSameDigits(numbers)) {
      throw new Error('CNPJ não pode ter todos os dígitos iguais');
    }

    if (!this.isValidCnpj(numbers)) {
      throw new Error('CNPJ inválido');
    }
  }

  private isAllSameDigits(cnpj: string): boolean {
    return /^(\d)\1{13}$/.test(cnpj);
  }

  private isValidCnpj(cnpj: string): boolean {
    // Remove caracteres não numéricos
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length !== 14) return false;
    if (this.isAllSameDigits(numbers)) return false;

    let sum = 0;
    let weight = 5;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(numbers[12]) !== firstDigit) return false;

    sum = 0;
    weight = 6;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(numbers[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(numbers[13]) === secondDigit;
  }

  getValue(): string {
    return this.value;
  }

  getNumbers(): string {
    return this.value.replace(/\D/g, '');
  }

  equals(other: CnpjVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
