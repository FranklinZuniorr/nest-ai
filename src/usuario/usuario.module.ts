import { Module } from "@nestjs/common";
import { UsuarioController } from "./usuario.controller";
import { UsuarioService } from "./usuario.service";
import { IsEmailDeUsuarioUnicoConstraint } from "./is-email-de-usuario-unico.validator";
import { BcryptService } from "./bcrypt/bcrypt.service";

@Module({
    controllers: [UsuarioController],
    providers: [
        UsuarioService,
        IsEmailDeUsuarioUnicoConstraint,
        BcryptService
    ]
})
export class UsuarioModule {}