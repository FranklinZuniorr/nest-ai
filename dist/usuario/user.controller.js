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
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_entity_1 = require("./user.entity");
const nest_response_builder_1 = require("../core/http/nest-response-builder");
const platform_express_1 = require("@nestjs/platform-express");
const refreshAndAccessDto_1 = require("./accessTokenAndRefreshToken/refreshAndAccessDto");
const user_entity_edit_1 = require("./user.entity.edit");
const email_entity_1 = require("./email.entity");
const verify_token_interceptor_1 = require("../core/http/verify-token-interceptor");
const user_entity_login_1 = require("./user.entity.login");
let UsuarioController = class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async createUser(usuario) {
        const userCreated = await this.usuarioService.create(usuario);
        console.log(userCreated);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(userCreated.status)
            .comHeaders({
            'Info': userCreated.r
        })
            .comBody(userCreated)
            .build();
    }
    ;
    async editUser(usuario, accessToken) {
        const data = await this.usuarioService.edit(accessToken, usuario);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async removeUser(accessToken) {
        const data = await this.usuarioService.delete(accessToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async forgetPassword(email) {
        const data = await this.usuarioService.editPassword(email);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async loginUser(usuario) {
        const userLogged = await this.usuarioService.login(usuario);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(userLogged.status)
            .comHeaders({
            'Info': userLogged.r
        })
            .comBody(userLogged)
            .build();
    }
    ;
    async logoutUser(accessToken) {
        const userLogged = await this.usuarioService.logout(accessToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(userLogged.status)
            .comHeaders({
            'Info': userLogged.r
        })
            .comBody(userLogged)
            .build();
    }
    ;
    async upload(file, accessToken, code) {
        console.log("Acces OK");
        const data = await this.usuarioService.uploadImage(file, code, accessToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async verifyRefreshToken(refreshToken) {
        const data = await this.usuarioService.refreshToken(refreshToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async verifyAccessToken(accessToken) {
        const data = await this.usuarioService.accessToken(accessToken.accessToken);
        return new nest_response_builder_1.NestResponseBuilder()
            .comStatus(data.status)
            .comHeaders({
            'Info': data.r
        })
            .comBody(data)
            .build();
    }
    ;
    async verifyPurchaseCoins() {
    }
    ;
};
__decorate([
    (0, common_1.Post)('new-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.UserDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('edit-user'),
    (0, common_1.UseInterceptors)(verify_token_interceptor_1.VerifyTokenInterceptor),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('accessToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_edit_1.UserEdit, String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUser", null);
__decorate([
    (0, common_1.Delete)('delete-user'),
    (0, common_1.UseInterceptors)(verify_token_interceptor_1.VerifyTokenInterceptor),
    __param(0, (0, common_1.Headers)('accessToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "removeUser", null);
__decorate([
    (0, common_1.Post)('forget-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [email_entity_1.Email]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "forgetPassword", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_login_1.UserLogin]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseInterceptors)(verify_token_interceptor_1.VerifyTokenInterceptor),
    __param(0, (0, common_1.Headers)('accessToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "logoutUser", null);
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return callback(new Error('Só imagens são permitidas!'), false);
            }
            callback(null, true);
        },
    })),
    (0, common_1.UseInterceptors)(verify_token_interceptor_1.VerifyTokenInterceptor),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Headers)('accessToken')),
    __param(2, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refreshAndAccessDto_1.RefreshDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "verifyRefreshToken", null);
__decorate([
    (0, common_1.Post)('access-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refreshAndAccessDto_1.AccessDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "verifyAccessToken", null);
__decorate([
    (0, common_1.Post)('verify-purchase-coins'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "verifyPurchaseCoins", null);
UsuarioController = __decorate([
    (0, common_1.Controller)('/'),
    __metadata("design:paramtypes", [user_service_1.UsuarioService])
], UsuarioController);
exports.UsuarioController = UsuarioController;
//# sourceMappingURL=user.controller.js.map