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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const AuthService_1 = require("../usuario/accessTokenAndRefreshToken/AuthService");
const utils_1 = require("../utils/utils");
const user_service_1 = require("../usuario/user.service");
const axios_1 = require("axios");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../mongoDb/user.schema");
const mongoose_2 = require("mongoose");
require("dotenv").config();
const jwtService = new jwt_1.JwtService();
let AiService = class AiService extends AuthService_1.AuthService {
    constructor(usuarioService, userModel) {
        super(jwtService);
        this.usuarioService = usuarioService;
        this.userModel = userModel;
    }
    async solicitarAi(text, accessToken) {
        const verifyToken = await this.verifyToken(accessToken, "access");
        const userFound = await this.userModel.findById(verifyToken.user.id)
            .exec();
        const { coins } = userFound.toObject();
        if (coins > 0) {
            const apiKey = process.env.OPENAI_API_KEY;
            const baseURL = "https://api.openai.com/v1";
            const openai = axios_1.default.create({
                baseURL,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            });
            let prompt = text.msg;
            const model = "text-davinci-003";
            const maxTokens = 500;
            const temperature = 1;
            const data = {
                prompt,
                model,
                max_tokens: maxTokens,
                temperature,
            };
            const dataRes = openai
                .post("/completions", data)
                .then(async (response) => {
                const answer = response.data.choices[0].text.trim();
                const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, { $inc: {
                        coins: -1
                    }
                }, { new: true }).exec();
                return { r: true, data: answer, status: common_1.HttpStatus.OK };
            })
                .catch((error) => {
                return { r: false, data: { info: utils_1.utils.errorExternalServicesTreatment(error), msg: "OpenAi error." }, status: common_1.HttpStatus.INTERNAL_SERVER_ERROR };
            });
            return dataRes;
        }
        else {
            return { r: false, data: { msg: "Coins insuficientes!" }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
    }
    ;
};
AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [user_service_1.UsuarioService, mongoose_2.Model])
], AiService);
exports.AiService = AiService;
;
//# sourceMappingURL=ai.service.js.map