import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class Themes {

    @Expose({
        name: 'page'
    })
    @IsNotEmpty({
        message: 'Page é obrigatório.'
    })
    @IsString({
        message: "Page é um number!"
    })
    page: number;
};