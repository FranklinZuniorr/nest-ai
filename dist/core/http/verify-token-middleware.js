"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = void 0;
const common_1 = require("@nestjs/common");
const AuthService_1 = require("../../usuario/accessTokenAndRefreshToken/AuthService");
let JwtMiddleware = class JwtMiddleware extends AuthService_1.AuthService {
    async use(req, res, next) {
        const token = "accesstoken" in req ? req.headers.accesstoken.toString() : "";
        try {
            const data = await this.verifyAccessTokenPass(token);
            console.log(data);
            if (!data.r)
                throw data;
            next();
        }
        catch (error) {
            console.log(error);
            res.status(error.status).send(error);
        }
    }
};
JwtMiddleware = __decorate([
    (0, common_1.Injectable)()
], JwtMiddleware);
exports.JwtMiddleware = JwtMiddleware;
//# sourceMappingURL=verify-token-middleware.js.map