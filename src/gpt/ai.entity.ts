import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

export class Ai {

    @IsNotEmpty({
        message: 'text é obrigatório.'
    })
    @Expose({
        name: 'msg'
    })
    msg: string;

}