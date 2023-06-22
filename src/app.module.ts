import { Module, ClassSerializerInterceptor, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { UsuarioModule } from './usuario/user.module';
import { FilterOfExceptionHttp } from './common/filtros/filter-of-exception-http.filter';
import { TransformResponseInterceptor } from './core/http/transform-response.interceptor';
import { AiModule } from './gpt/ai.module';
import { DatabaseModule } from './mongoDb/dataBase.module';
import { PaymentModule } from './payment/payment.module';
import * as bodyParser from 'body-parser';
import { RawBodyMiddleware } from './core/http/raw-body.middleware';
import { JsonBodyMiddleware } from './core/http/json-body.middleware';
@Module({
  imports: [UsuarioModule, AiModule, DatabaseModule, PaymentModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FilterOfExceptionHttp
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor
    }
  ],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
        .apply(RawBodyMiddleware)
        .forRoutes({
            path: '/stripe/webhook',
            method: RequestMethod.POST,
        })
        .apply(JsonBodyMiddleware)
        .forRoutes('*');
  }
}
