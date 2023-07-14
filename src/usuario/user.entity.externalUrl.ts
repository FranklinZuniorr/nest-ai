import { IsNotEmpty, IsString, IsEmail, Matches, IsNotEmptyObject, isNotEmpty, IsObject, IsNumber, isURL, IsUrl } from 'class-validator';
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
    @IsUrl(undefined, {message: "Precisa ser um link!"})
    externalUrl: string;
};