/// <reference types="mongoose/types/models" />
import { Ai } from './ai.entity';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { UsuarioService } from 'src/usuario/user.service';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
export declare class AiService extends AuthService {
    usuarioService: UsuarioService;
    private userModel;
    constructor(usuarioService: UsuarioService, userModel: Model<User>);
    solicitarAi(text: Ai, accessToken: string): Promise<any>;
}
