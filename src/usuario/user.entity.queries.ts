import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IsEmailDeUsuarioUnico } from './is-email-de-usuario-unico.validator';

export class UserQueries {

    @Expose({
        name: 'query'
    })
    @IsNotEmpty({
        message: 'Query é obrigatório.'
    })
    @IsObject({
        message: "Query é um objeto!"
    })
    query: object;
};