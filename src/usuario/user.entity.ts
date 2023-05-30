import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class UserDto {
    id?: number;


    @Expose({
        name: 'email'
    })
    @IsEmail({}, {
        message: 'E-mail precisa ser um endereço de email válido.'
    })
    email: string;


    @Expose({
        name: 'username'
    })
    @IsNotEmpty({
        message: 'Nome é obrigatório!'
    })
    @Matches(/^.{15,20}$/, {
        message: 'O nome precisa ter no mínimo 15 caracteres e no máximo 20'
    })
    username: string;

    
    @Expose({
        name: 'password'
    })
    @Exclude({
        toPlainOnly: true
    })
    @IsNotEmpty({
        message: 'Senha é obrigatório.'
    })
    @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e 8 caracteres ao todo.'
    })
    password: string | Promise<string>;

    exist?: boolean;
};