import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, IsOptional } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class UsuarioEdit {
    id?: number;


    @Expose({
        name: 'email'
    })
    @IsEmail({}, {
        message: 'E-mail precisa ser um endereço de email válido.'
    })
    @IsOptional()
    email?: string;


    @Expose({
        name: 'username'
    })
    username?: string;


    @Expose({
        name: 'password'
    })
    @Exclude({
        toPlainOnly: true
    })
    @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e 8 caracteres ao todo.'
    })
    @IsOptional()
    password?: string | Promise<string>;
}