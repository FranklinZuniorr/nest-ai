"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyTokenInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const nest_response_builder_1 = require("./nest-response-builder");
const user_service_1 = require("../../usuario/user.service");
let VerifyTokenInterceptor = class VerifyTokenInterceptor {
    constructor(UsuarioService) {
        this.UsuarioService = UsuarioService;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const accessToken = request.headers.accesstoken;
        const dataVerify = await this.UsuarioService.accessToken(accessToken);
        console.log(dataVerify);
        if (!dataVerify.r) {
            const res = new nest_response_builder_1.NestResponseBuilder()
                .comStatus(dataVerify.status)
                .comHeaders({
                'Info': dataVerify.r
            })
                .comBody(dataVerify)
                .build();
            return (0, rxjs_1.of)(res);
        }
        ;
        return next.handle();
    }
    ;
};
VerifyTokenInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UsuarioService])
], VerifyTokenInterceptor);
exports.VerifyTokenInterceptor = VerifyTokenInterceptor;
;
//# sourceMappingURL=verify-token-interceptor.js.map