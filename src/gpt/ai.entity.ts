import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class Ai {

    @Expose({
        name: 'msg'
    })
    @IsNotEmpty({
        message: 'text é obrigatório.'
    })
    msg: string;

}