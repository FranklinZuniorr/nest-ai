import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { UsuarioModule } from "src/usuario/user.module";
import { UsuarioService } from "src/usuario/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/mongoDb/user.schema";

@Module({
    imports: [UsuarioModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [AiController],
    providers: [
        AiService,
        UsuarioService
    ]
})
export class AiModule {}