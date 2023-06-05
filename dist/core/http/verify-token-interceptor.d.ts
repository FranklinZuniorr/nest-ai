import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NestResponse } from './nest-response';
import { UsuarioService } from 'src/usuario/user.service';
export declare class VerifyTokenInterceptor implements NestInterceptor {
    private readonly UsuarioService;
    constructor(UsuarioService: UsuarioService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<NestResponse>>;
}
