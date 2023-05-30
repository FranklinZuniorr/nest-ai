import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class UserLogin {
    id?: number;


    @Expose({
        name: 'email'
    })
    @IsEmail({}, {
        message: 'E-mail precisa ser um endereço de email válido.'
    })
    @IsNotEmpty({
        message: 'E-mail é obrigatório.'
    })
    email: string;

    
    @Expose({
        name: 'password'
    })
    @Exclude({
        toPlainOnly: true
    })
    @IsNotEmpty({
        message: 'Senha é obrigatório.'
    })
    password: string | Promise<string>;
};