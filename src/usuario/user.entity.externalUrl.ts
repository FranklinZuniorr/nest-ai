import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class ExternalUrl {

    @Expose({
        name: 'externalUrl'
    })
    @IsNotEmpty({
        message: 'ExternalUrl é obrigatório.'
    })
    @IsString({
        message: "ExternalUrl é uma string!"
    })
    externalUrl: string;
};