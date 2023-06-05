/// <reference types="mongoose/types/models" />
import { HttpStatus } from '@nestjs/common';
import { UserDto } from './user.entity';
import { AuthService } from './accessTokenAndRefreshToken/AuthService';
import { RefreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { response, responseBuscaPorEmailDeUsuario, responseBuscaPorNomeDeUsuario } from 'src/core/http/responseDto/response';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { UserEdit } from './user.entity.edit';
import { Email } from './email.entity';
import { RabbitMQService } from 'src/rabbitMq/rabbitMq.service';
import { UserLogin } from './user.entity.login';
export declare class UsuarioService extends AuthService {
    private userModel;
    private readonly rabbitMQService;
    constructor(userModel: Model<User>, rabbitMQService: RabbitMQService);
    create(usuario: UserDto): Promise<response>;
    edit(token: string, body: UserEdit): Promise<response>;
    delete(token: string): Promise<response>;
    login(usuario: UserLogin): Promise<response>;
    logout(accessToken: string): Promise<{
        r: boolean;
        data: {
            msg: string;
        };
        status: HttpStatus;
    }>;
    uploadImage(file: any, code: string, token: string): Promise<response>;
    editPassword(emailInfo: Email): Promise<response>;
    refreshToken(refreshToken: RefreshDto): Promise<response>;
    accessToken(accessToken: string): Promise<response>;
    private setHash;
    private compareHashedPasswordAndPassword;
    buscaPorEmailDeUsuario(email: string): Promise<responseBuscaPorEmailDeUsuario>;
    buscaPorNomeDeUsuario(username: string): Promise<responseBuscaPorNomeDeUsuario>;
}
