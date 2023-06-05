import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class TransformResponseInterceptor implements NestInterceptor {
    private httpAdapter;
    constructor(adapterHost: HttpAdapterHost);
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>>;
}
