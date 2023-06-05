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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const utils_1 = require("../../utils/utils");
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    ;
    async generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
        });
    }
    ;
    async generateRefreshToken(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
        });
    }
    ;
    async verifyToken(token, type) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                ignoreExpiration: false,
                secret: type == "refresh" ? process.env.REFRESH_TOKEN_SECRET : process.env.ACCESS_TOKEN_SECRET
            });
            return payload;
        }
        catch (err) {
            return err;
        }
        ;
    }
    ;
    async verifyRefreshTokenAndGenerateTokens(refreshToken) {
        console.log(refreshToken.refreshToken);
        if (utils_1.utils.verifyCond(refreshToken.refreshToken)) {
            const verify = await this.verifyToken(refreshToken.refreshToken, "refresh");
            if (verify.name === 'TokenExpiredError') {
                return {
                    r: false,
                    data: Object.assign(Object.assign({}, verify), { msg: "RefreshTokenExpiredError!" }),
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            ;
            if (verify.name === "JsonWebTokenError") {
                return {
                    r: false,
                    data: { info: utils_1.utils.errorExternalServicesTreatment(verify), msg: "JsonWebRefreshTokenError!" },
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            ;
            return {
                r: true,
                data: {
                    msg: "RefreshTokenOk!",
                    token: await this.generateAccessToken({ user: { id: verify.user.id, email: verify.user.email, username: verify.user.username }, type: "access" }),
                    refreshToken: await this.generateRefreshToken({ user: { id: verify.user.id, email: verify.user.email, username: verify.user.username }, type: "refresh" })
                },
                status: common_1.HttpStatus.ACCEPTED
            };
        }
        return {
            r: false,
            data: { msg: "Nenhum refreshToken encontrado!" },
            status: common_1.HttpStatus.BAD_REQUEST
        };
    }
    ;
    async verifyAccessTokenPass(accessToken) {
        if (utils_1.utils.verifyCond(accessToken)) {
            const verify = await this.verifyToken(accessToken, "access");
            if (verify.name === 'TokenExpiredError') {
                return {
                    r: false,
                    data: { msg: "AccessTokenExpiredError!" },
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            ;
            if (verify.name === "JsonWebTokenError") {
                return {
                    r: false,
                    data: { info: utils_1.utils.errorExternalServicesTreatment(verify), msg: "JsonWebAccessTokenError!" },
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            ;
            return {
                r: true,
                data: { msg: "AccessTokenOk!", verify },
                status: common_1.HttpStatus.ACCEPTED
            };
        }
        return {
            r: false,
            data: { msg: "Nenhum accessToken encontrado!" },
            status: common_1.HttpStatus.BAD_REQUEST
        };
    }
    ;
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
;
//# sourceMappingURL=AuthService.js.map