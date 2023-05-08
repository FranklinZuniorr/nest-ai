import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
export class OptionalValidatorConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    if (value !== undefined) {
      const [object, propertyName] = args.constraints;
      const validator = new (args.constraints[2])();
      return validator.validate(value);
    }
    return true;
  }
}

export function OptionalValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      propertyName,
      options: validationOptions,
      target: object.constructor,
      constraints: [object, propertyName, ...(validationOptions?.each ? [validationOptions.each] : [])],
      validator: OptionalValidatorConstraint,
    });
  };
}
