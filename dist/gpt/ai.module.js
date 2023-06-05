"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_controller_1 = require("./ai.controller");
const user_module_1 = require("../usuario/user.module");
const user_service_1 = require("../usuario/user.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../mongoDb/user.schema");
const verify_token_interceptor_1 = require("../core/http/verify-token-interceptor");
const AuthService_1 = require("../usuario/accessTokenAndRefreshToken/AuthService");
const jwt_1 = require("@nestjs/jwt");
const rabbitMq_service_1 = require("../rabbitMq/rabbitMq.service");
let AiModule = class AiModule {
};
AiModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UsuarioModule, mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }])],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            user_service_1.UsuarioService,
            AuthService_1.AuthService,
            jwt_1.JwtService,
            verify_token_interceptor_1.VerifyTokenInterceptor,
            rabbitMq_service_1.RabbitMQService
        ]
    })
], AiModule);
exports.AiModule = AiModule;
//# sourceMappingURL=ai.module.js.map