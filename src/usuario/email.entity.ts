import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class Email {
    @Expose({
        name: 'email'
    })
    @IsEmail({}, {
        message: 'E-mail precisa ser um endereço de email válido.'
    })
    email: string;
}