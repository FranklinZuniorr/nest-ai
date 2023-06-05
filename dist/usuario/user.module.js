"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const is_email_de_usuario_unico_validator_1 = require("./is-email-de-usuario-unico.validator");
const bcrypt_service_1 = require("./bcrypt/bcrypt.service");
const AuthService_1 = require("./accessTokenAndRefreshToken/AuthService");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../mongoDb/user.schema");
const verify_token_interceptor_1 = require("../core/http/verify-token-interceptor");
const rabbitMq_service_1 = require("../rabbitMq/rabbitMq.service");
let UsuarioModule = class UsuarioModule {
};
UsuarioModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
        ],
        controllers: [user_controller_1.UsuarioController],
        providers: [
            user_service_1.UsuarioService,
            is_email_de_usuario_unico_validator_1.IsEmailDeUsuarioUnicoConstraint,
            bcrypt_service_1.BcryptService,
            AuthService_1.AuthService,
            jwt_1.JwtService,
            verify_token_interceptor_1.VerifyTokenInterceptor,
            rabbitMq_service_1.RabbitMQService
        ]
    })
], UsuarioModule);
exports.UsuarioModule = UsuarioModule;
;
//# sourceMappingURL=user.module.js.map