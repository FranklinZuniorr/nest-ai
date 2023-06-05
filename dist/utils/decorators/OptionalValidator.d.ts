import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class OptionalValidatorConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): Promise<any>;
}
export declare function OptionalValidator(validationOptions?: ValidationOptions): (object: any, propertyName: string) => void;
