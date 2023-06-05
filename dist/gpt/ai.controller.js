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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const nest_response_builder_1 = require("../core/http/nest-response-builder");
const ai_service_1 = require("./ai.service");
const ai_entity_1 = require("./ai.entity");
const verify_token_interceptor_1 = require("../core/http/verify-token-interceptor");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    ;
    async getAiResponse(text, accessToken) {
        const response = await this.aiService.solicitarAi(text, accessToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(response.status)
            .comHeaders({
            'Info': response.r
        })
            .comBody(response)
            .build();
    }
    ;
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(verify_token_interceptor_1.VerifyTokenInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('accessToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_entity_1.Ai, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getAiResponse", null);
AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
exports.AiController = AiController;
;
//# sourceMappingURL=ai.controller.js.map