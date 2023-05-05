import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { UsuarioModule } from './usuario/usuario.module';
import { FitroDeExcecaoHttp } from './common/filtros/filtro-de-excecao-http.filter';
import { TransformaRespostaInterceptor } from './core/http/transforma-resposta.interceptor';
import { AiModule } from './gpt/ai.module';
import { AuthService } from './usuario/accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [UsuarioModule, AiModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FitroDeExcecaoHttp
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformaRespostaInterceptor
    }
  ],
})
export class AppModule {}
