import { Module } from "@nestjs/common";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { IsEmailDeUsuarioUnicoConstraint } from "./is-email-de-usuario-unico.validator";
import { BcryptService } from "./bcrypt/bcrypt.service";
import { AuthService } from "./accessTokenAndRefreshToken/AuthService";
import { JwtService } from "@nestjs/jwt";
@Module({
    controllers: [UsuarioController],
    providers: [
        UsuarioService,
        IsEmailDeUsuarioUnicoConstraint,
        BcryptService,
        AuthService,
        JwtService
    ]
})
export class UsuarioModule {}