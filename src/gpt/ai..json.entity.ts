import { IsNotEmpty, IsString, IsEmail, IsObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class AiJson {

    @IsNotEmpty({
        message: 'Texto é obrigatório.'
    })
    @Expose({
        name: 'msg'
    })
    msg: string;
    

    @IsNotEmpty({
        message: 'Esquema é obrigatório.'
    })
    @IsObject({
        message: "Esquema é um objeto!"
    })
    @Expose({
        name: 'schema'
    })
    schema: object

};