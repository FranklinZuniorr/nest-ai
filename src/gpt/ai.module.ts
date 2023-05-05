import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { UsuarioModule } from "src/usuario/usuario.module";
import { UsuarioService } from "src/usuario/usuario.service";

@Module({
    imports: [UsuarioModule],
    controllers: [AiController],
    providers: [
        AiService,
        UsuarioService
    ]
})
export class AiModule {}