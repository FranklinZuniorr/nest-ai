import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class Usuario {
    id: number;


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
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.'
    })
    senha: string | Promise<string>;

    exist?: boolean;
}