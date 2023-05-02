import { registerDecorator, ValidationOptions, ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Injectable()
@ValidatorConstraint()
export class IsEmailDeUsuarioUnicoConstraint implements ValidatorConstraintInterface {

    constructor(private usuarioService: UsuarioService) {}

    validate(emailDeUsuario: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        console.log(!!!this.usuarioService.buscaPorEmailDeUsuario(emailDeUsuario))
        return !!!this.usuarioService.buscaPorEmailDeUsuario(emailDeUsuario);
    }
}

export function IsEmailDeUsuarioUnico(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailDeUsuarioUnicoConstraint,
        });
    };
}
  