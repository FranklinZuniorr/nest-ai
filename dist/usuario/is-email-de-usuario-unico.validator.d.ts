import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { UsuarioService } from './user.service';
export declare class IsEmailDeUsuarioUnicoConstraint implements ValidatorConstraintInterface {
    private usuarioService;
    constructor(usuarioService: UsuarioService);
    validate(emailDeUsuario: string, validationArguments?: ValidationArguments): boolean | Promise<boolean>;
}
export declare function IsEmailDeUsuarioUnico(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
