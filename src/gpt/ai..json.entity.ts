import { IsNotEmpty, IsString, IsEmail, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';

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
        message: 'Note é obrigatório.'
    })
    @Expose({
        name: 'note'
    })
    note: string;
    

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

export class AiJsonArray {

    @IsNotEmpty({
        message: 'Esquema é obrigatório.'
    })
    @IsArray({
        message: "Array é um []!"
    })
    @Expose({
        name: 'array'
    })
    @ValidateNested({ each: true })
    @Type(() => AiJson)
    array: AiJson[];
    
};