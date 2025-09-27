import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CnpjVO } from '../domain/value-objects/cnpj.vo';

@ValidatorConstraint({ name: 'isValidCnpj', async: false })
export class IsValidCnpjConstraint implements ValidatorConstraintInterface {
  validate(cnpj: string | null | undefined) {
    if (!cnpj || typeof cnpj !== 'string') return false;

    try {
      new CnpjVO(cnpj);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'CNPJ inválido';
  }
}

export function IsValidCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidCnpjConstraint,
    });
  };
}
