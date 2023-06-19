import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { UsuarioModule } from './usuario/user.module';
import { FilterOfExceptionHttp } from './common/filtros/filter-of-exception-http.filter';
import { TransformResponseInterceptor } from './core/http/transform-response.interceptor';
import { AiModule } from './gpt/ai.module';
import { DatabaseModule } from './mongoDb/dataBase.module';
import { PayPalModule } from './payPal/paypal.module';
@Module({
  imports: [UsuarioModule, AiModule, DatabaseModule, PayPalModule],
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
export class AppModule {}
