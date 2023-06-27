import { IsNotEmpty, IsString, IsEmail, IsObject } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class AiJson {

    @IsNotEmpty({
        message: 'Msg é obrigatório.'
    })
    @Expose({
        name: 'msg'
    })
    msg: string;


    @IsNotEmpty({
        message: 'Title é obrigatório.'
    })
    @Expose({
        name: 'title'
    })
    title: string;
    

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