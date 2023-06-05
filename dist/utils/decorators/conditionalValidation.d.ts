import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class ConditionalValidation implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
}
