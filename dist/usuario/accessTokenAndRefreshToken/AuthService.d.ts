import { JwtService } from '@nestjs/jwt';
import { RefreshDto } from './refreshAndAccessDto';
import { response } from 'src/core/http/responseDto/response';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    generateAccessToken(payload: object): Promise<string>;
    generateRefreshToken(payload: object): Promise<string>;
    verifyToken(token: string, type: string): Promise<any>;
    verifyRefreshTokenAndGenerateTokens(refreshToken: RefreshDto): Promise<response>;
    verifyAccessTokenPass(accessToken: string): Promise<response>;
}
