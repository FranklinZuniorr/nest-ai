import { Module } from "@nestjs/common";
import { UsuarioModule } from "src/usuario/user.module";
import { UsuarioService } from "src/usuario/user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/mongoDb/user.schema";
import { VerifyTokenInterceptor } from "src/core/http/verify-token-interceptor";
import { AuthService } from "src/usuario/accessTokenAndRefreshToken/AuthService";
import { JwtService } from "@nestjs/jwt";
import { RabbitMQService } from "src/rabbitMq/rabbitMq.service";
import { Access, AccessSchema } from "src/mongoDb/access.schema ";
import { PayPalService } from "./paypal.service";
import { PayPalController } from "./paypal.controller";

@Module({
    imports: [UsuarioModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {name: Access.name, schema: AccessSchema}])],
    controllers: [PayPalController],
    providers: [
        PayPalService,
        UsuarioService,
        AuthService,
        JwtService,
        VerifyTokenInterceptor,
        RabbitMQService
    ]
})
export class PayPalModule {}