import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
export declare class JwtMiddleware extends AuthService implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
