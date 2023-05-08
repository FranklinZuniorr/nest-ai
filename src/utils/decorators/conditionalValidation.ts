import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'conditionalValidation', async: false })
export class ConditionalValidation implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [field, condition] = args.constraints;
    if (!condition) return true;

    return value !== undefined;
  }
}