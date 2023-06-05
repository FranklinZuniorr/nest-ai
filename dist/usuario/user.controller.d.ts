import { UsuarioService } from './user.service';
import { UserDto } from './user.entity';
import { NestResponse } from '../core/http/nest-response';
import { AccessDto, RefreshDto } from './accessTokenAndRefreshToken/refreshAndAccessDto';
import { UserEdit } from './user.entity.edit';
import { Email } from './email.entity';
import { UserLogin } from './user.entity.login';
export declare class UsuarioController {
    private usuarioService;
    constructor(usuarioService: UsuarioService);
    createUser(usuario: UserDto): Promise<NestResponse>;
    editUser(usuario: UserEdit, accessToken: string): Promise<NestResponse>;
    removeUser(accessToken: string): Promise<NestResponse>;
    forgetPassword(email: Email): Promise<NestResponse>;
    loginUser(usuario: UserLogin): Promise<NestResponse>;
    logoutUser(accessToken: string): Promise<NestResponse>;
    upload(file: any, accessToken: string, code: string): Promise<NestResponse>;
    verifyRefreshToken(refreshToken: RefreshDto): Promise<NestResponse>;
    verifyAccessToken(accessToken: AccessDto): Promise<NestResponse>;
    verifyPurchaseCoins(): Promise<void>;
}
