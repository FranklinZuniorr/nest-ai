import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError, map, catchError, of } from 'rxjs';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { NestResponse } from './nest-response';
import { NestResponseBuilder } from './nest-response-builder';

@Injectable()
export class VerifyTokenInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<NestResponse>> {
    const request = context.switchToHttp().getRequest();
    /* console.log(request) */
    const accessToken = request.headers.accesstoken;

    
    const dataVerify = await this.authService.verifyAccessTokenPass(accessToken);
    console.log(dataVerify)
    /* if (!dataVerify.r) {
        throw dataVerify
    } */
    
    return next.handle().pipe(
        map(data => {
            if(!dataVerify.r){
                return new NestResponseBuilder()
                .comStatus(dataVerify.status)
                .comHeaders({
                    'Info': dataVerify.r
                })
                .comBody(dataVerify)
                .build();
            }
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

            if(!dataVerify.r){
                return of(response)
            }
          })
    );

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

  }
}



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


