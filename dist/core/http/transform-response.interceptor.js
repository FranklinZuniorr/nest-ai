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
exports.TransformResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const nest_response_1 = require("./nest-response");
let TransformResponseInterceptor = class TransformResponseInterceptor {
    constructor(adapterHost) {
        this.httpAdapter = adapterHost.httpAdapter;
    }
    intercept(context, next) {
        return next.handle()
            .pipe((0, operators_1.map)((respostaDoControlador) => {
            if (respostaDoControlador instanceof nest_response_1.NestResponse) {
                const contexto = context.switchToHttp();
                const response = contexto.getResponse();
                const { headers, status, body } = respostaDoControlador;
                const nomesDosCabecalhos = Object.getOwnPropertyNames(headers);
                nomesDosCabecalhos.forEach(nomeDoCabecalho => {
                    const valorDoCabecalho = headers[nomeDoCabecalho];
                    this.httpAdapter.setHeader(response, nomeDoCabecalho, valorDoCabecalho);
                });
                this.httpAdapter.status(response, status);
                return body;
            }
            return respostaDoControlador;
        }));
    }
};
TransformResponseInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], TransformResponseInterceptor);
exports.TransformResponseInterceptor = TransformResponseInterceptor;
//# sourceMappingURL=transform-response.interceptor.js.map