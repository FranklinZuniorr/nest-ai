import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject, IsNumber } from 'class-validator';
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


    @Expose({
        name: 'theme'
    })
    @IsNotEmpty({
        message: 'Tema é obrigatório.'
    })
    @IsString({
        message: "Tema é uma string!"
    })
    theme: string;


    @Expose({
        name: 'note'
    })
    @IsNotEmpty({
        message: 'Nota é obrigatório.'
    })
    @IsString({
        message: "Nota é uma string!"
    })
    note: string;


    @Expose({
        name: 'essay'
    })
    @IsNotEmpty({
        message: 'Redação é obrigatório.'
    })
    @IsString({
        message: "Redação é uma string!"
    })
    essay: string;
};