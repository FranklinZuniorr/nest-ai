import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserTop10 {

    @Expose({
        name: 'prop'
    })
    @IsNotEmpty({
        message: 'Prop é obrigatório.'
    })
    @IsString({
        message: "Prop é uma string!"
    })
    prop: string;
};