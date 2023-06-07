import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError, map, catchError, of } from 'rxjs';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { NestResponse } from './nest-response';
import { NestResponseBuilder } from './nest-response-builder';
import { UsuarioService } from 'src/usuario/user.service';

@Injectable()
export class VerifyTokenInterceptor implements NestInterceptor {
  constructor(private readonly UsuarioService: UsuarioService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<NestResponse>> {
    const request = context.switchToHttp().getRequest();
    /* console.log(request) */
    const accessToken = request.headers.accesstoken;

    const dataVerify = await this.UsuarioService.accessToken(accessToken);
    console.log(dataVerify)

    if (!dataVerify.r) {
      console.log("err1")
      const res = new NestResponseBuilder()
      .comStatus(dataVerify.status)
      .comHeaders({
          'Info': dataVerify.r
      })
      .comBody(dataVerify)
      .build();

      return of(res)
    };

    console.log("err2")
    return next.handle();

    /* ------------------------------------------- */
    
    /* return next.handle().pipe(
        map(data => {
            if(dataVerify.r == false){
                return new NestResponseBuilder()
                .comStatus(dataVerify.status)
                .comHeaders({
                    'Info': dataVerify.r
                })
                .comBody(dataVerify)
                .build();
            };
            return data
        }),
        catchError((err) => {
            const response = new NestResponseBuilder()
            .comStatus(dataVerify.status)
            .comHeaders({
                'Info': dataVerify.r
            })
            .comBody(dataVerify)
            .build();

            if(dataVerify.r == false){
                return of(response);
            };
          })
    ); */

    /* ------------------------------------------- */

        /* map((data) => {
            return new NestResponseBuilder()
            .comStatus(dataVerify.status)
            .comHeaders({
                'Info': dataVerify.r
            })
            .comBody(dataVerify)
            .build();
        }) */

    /* return next.handle(); */

  };
};



/* @Injectable()
export class LoggingInterceptor implements NestInterceptor {

constructor(private readonly authService: AuthService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const request = context.switchToHttp().getRequest();
    console.log(request)
    const accessToken = request.headers.accesstoken;
    const data = await this.authService.verifyAccessTokenPass(accessToken);

    return next
      .handle()
      .pipe(
        t
      );
  }
} */


