import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsuarioController } from "./user.controller";
import { UsuarioService } from "./user.service";
import { IsEmailDeUsuarioUnicoConstraint } from "./is-email-de-usuario-unico.validator";
import { BcryptService } from "./bcrypt/bcrypt.service";
import { AuthService } from "./accessTokenAndRefreshToken/AuthService";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/mongoDb/user.schema";
import { JwtMiddleware } from "src/core/http/verify-token-middleware";
import { VerifyTokenInterceptor } from "src/core/http/verify-token-interceptor";
import { RabbitMQService } from "src/rabbitMq/rabbitMq.service";
import { Access, AccessSchema } from "src/mongoDb/access.schema";
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {name: Access.name, schema: AccessSchema}]),
    ],
    controllers: [UsuarioController],
    providers: [
        UsuarioService,
        IsEmailDeUsuarioUnicoConstraint,
        BcryptService,
        AuthService,
        JwtService,
        VerifyTokenInterceptor,
        RabbitMQService
    ]
})

export class UsuarioModule {};

/* export class UsuarioModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(JwtMiddleware)
        .forRoutes('upload-image');
    };
}; */