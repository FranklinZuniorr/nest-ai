import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { UsuarioModule } from "src/usuario/user.module";
import { UsuarioService } from "src/usuario/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/mongoDb/user.schema";
import { VerifyTokenInterceptor } from "src/core/http/verify-token-interceptor";
import { AuthService } from "src/usuario/accessTokenAndRefreshToken/AuthService";
import { JwtService } from "@nestjs/jwt";

@Module({
    imports: [UsuarioModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [AiController],
    providers: [
        AiService,
        UsuarioService,
        AuthService,
        JwtService,
        VerifyTokenInterceptor
    ]
})
export class AiModule {}