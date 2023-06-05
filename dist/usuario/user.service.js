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
exports.UsuarioService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_service_1 = require("./bcrypt/bcrypt.service");
const path_1 = require("path");
const Dropbox = require("dropbox");
const AuthService_1 = require("./accessTokenAndRefreshToken/AuthService");
const jwt_1 = require("@nestjs/jwt");
const utils_1 = require("../utils/utils");
const axios_1 = require("axios");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../mongoDb/user.schema");
const mongoose_2 = require("mongoose");
const rabbitMq_service_1 = require("../rabbitMq/rabbitMq.service");
const jwtService = new jwt_1.JwtService();
let UsuarioService = class UsuarioService extends AuthService_1.AuthService {
    constructor(userModel, rabbitMQService) {
        super(jwtService);
        this.userModel = userModel;
        this.rabbitMQService = rabbitMQService;
    }
    async create(usuario) {
        if (!(await this.buscaPorEmailDeUsuario(usuario.email)).exist && !(await this.buscaPorNomeDeUsuario(usuario.username)).exist) {
            const { email, password, username } = usuario;
            const userFilter = { email: email.toLowerCase(), password: await this.setHash(password), username, coins: 0, validToken: "", img: "" };
            const createdUser = new this.userModel(userFilter);
            createdUser.save();
            console.log(userFilter);
            return { r: true, data: { msg: "Registrado com sucesso!" }, status: common_1.HttpStatus.CREATED };
        }
        else {
            console.log(this.buscaPorEmailDeUsuario(usuario.email));
            if ((await this.buscaPorEmailDeUsuario(usuario.email)).exist && (await this.buscaPorNomeDeUsuario(usuario.username)).exist) {
                return { r: false, data: { msg: `E-mail e nome já existem na base de dados!` }, status: common_1.HttpStatus.BAD_REQUEST };
            }
            else {
                const emailAndNameExist = (await this.buscaPorEmailDeUsuario(usuario.email)).exist ? "E-mail" : "Nome";
                return { r: false, data: { msg: `${emailAndNameExist} já existe na base de dados!` }, status: common_1.HttpStatus.BAD_REQUEST };
            }
            ;
        }
        ;
    }
    ;
    async edit(token, body) {
        const verifyToken = await this.verifyToken(token, "access");
        let exist = {
            username: undefined,
            email: undefined
        };
        const { username, email, password, coins } = body;
        (await this.buscaPorEmailDeUsuario(email)).exist ? exist.email = true : false;
        (await this.buscaPorNomeDeUsuario(username)).exist ? exist.username = true : false;
        if (exist.email && exist.username) {
            return { r: false, data: { msg: `E-mail e nome já existem na base de dados!` }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
        if (exist.email || exist.username) {
            return { r: false, data: { msg: `${exist.email ? "E-mail" : "Nome"} já existe na base de dados!` }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
        if (!utils_1.utils.verifyCond(username) && !utils_1.utils.verifyCond(email) && !utils_1.utils.verifyCond(password)) {
            return { r: false, data: { msg: "Nenhum dado de alteração foi encontrado!" }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
        const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, { $set: Object.assign(Object.assign(Object.assign({}, (utils_1.utils.verifyCond(username) && !exist.username && { username })), (utils_1.utils.verifyCond(email) && !exist.email && { email: email.toLowerCase() })), (utils_1.utils.verifyCond(password) && { password: await this.setHash(password) })) }, { new: true }).exec();
        if (utils_1.utils.verifyCond(user)) {
            console.log(user);
            return { r: true, data: { msg: `${user.email} editado com sucesso!` }, status: common_1.HttpStatus.OK };
        }
        else {
            return { r: false, data: { msg: "Usuário não foi encontrado!" }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
    }
    ;
    async delete(token) {
        const verifyToken = await this.verifyToken(token, "access");
        const user = await this.userModel.findByIdAndRemove(verifyToken.user.id, { select: "email" }).exec();
        if (user) {
            console.log("---------------------");
            console.log(user);
            return { r: true, data: { msg: `${user.email} deletado com sucesso!` }, status: common_1.HttpStatus.OK };
        }
        ;
        return { r: false, data: { msg: "Usuário não foi encontrado!" }, status: common_1.HttpStatus.CREATED };
    }
    ;
    async login(usuario) {
        if ((await this.buscaPorEmailDeUsuario(usuario.email)).exist) {
            const userFound = await this.userModel.findOne({ "email": usuario.email.toLowerCase() })
                .exec()
                .then((doc) => doc === null || doc === void 0 ? void 0 : doc.toObject())
                .catch((err) => err);
            const { email, password, username, _id, img, coins } = userFound;
            const verification = await this.compareHashedPasswordAndPassword(usuario.password, password);
            const userFilter = { email: email, username: username, id: _id, img: img, coins: coins };
            if (!verification) {
                return { r: false, data: { msg: "Senha incorreta!" }, status: common_1.HttpStatus.BAD_REQUEST };
            }
            ;
            const newToken = await this.generateAccessToken({ user: userFilter, type: "access" });
            const userEdit = await this.userModel.findByIdAndUpdate(userFilter.id, { $set: {
                    validToken: newToken
                }
            }, { new: true }).exec();
            if (utils_1.utils.verifyCond(userEdit)) {
                return {
                    r: true,
                    data: {
                        token: newToken,
                        refreshToken: await this.generateRefreshToken({ user: userFilter, type: "refresh" })
                    },
                    status: common_1.HttpStatus.ACCEPTED
                };
            }
            ;
        }
        else {
            return { r: false, data: { msg: "Usuário não foi encontrado!" }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
    }
    ;
    async logout(accessToken) {
        const verifyToken = await this.verifyToken(accessToken, 'access');
        const userEdit = await this.userModel.findByIdAndUpdate(verifyToken.user.id, { $set: {
                validToken: ""
            }
        }, { new: true }).exec();
        if (utils_1.utils.verifyCond(userEdit)) {
            return { r: true, data: { msg: "Deslogado com sucesso!" }, status: common_1.HttpStatus.OK };
        }
        ;
    }
    ;
    async uploadImage(file, code, token) {
        console.log(file);
        console.log(code);
        if (code != undefined && code.length > 0) {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            const url = 'https://api.dropboxapi.com/oauth2/token';
            const data = new URLSearchParams();
            data.append('code', code);
            data.append('grant_type', 'authorization_code');
            data.append('client_id', process.env.DROPBOX_CLIENT_ID);
            data.append('client_secret', process.env.DROPBOX_CLIENT_SECRET);
            data.append('redirect_uri', process.env.DROPBOX_REDIRECT_URI);
            try {
                const response = await axios_1.default.post(url, data.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                if (response.statusText === "OK") {
                    const dropbox = new Dropbox.Dropbox({
                        accessToken: response.data.access_token,
                        clientId: process.env.DROPBOX_CLIENT_ID,
                        clientSecret: process.env.DROPBOX_CLIENT_SECRET
                    });
                    const verifyToken = await this.verifyToken(token, "access");
                    const result = await dropbox.filesUpload({
                        path: `/${randomName}${(0, path_1.extname)(file.originalname)}`,
                        contents: file.buffer,
                    }).then(res => res).catch(err => err);
                    if (result instanceof Error) {
                        return { r: false, data: { info: utils_1.utils.errorExternalServicesTreatment(result), msg: "Erro ao enviar imagem!" }, status: common_1.HttpStatus.INTERNAL_SERVER_ERROR };
                    }
                    ;
                    if (result.status == 200) {
                        try {
                            const userFilter = await this.userModel.findById(verifyToken.user.id).exec().then((doc) => doc === null || doc === void 0 ? void 0 : doc.toObject()).catch((err) => err);
                            const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
                                path: result.result.path_display,
                            }).catch(() => {
                                throw { msg: "GENERATE" };
                            });
                            const user = await this.userModel.findByIdAndUpdate(verifyToken.user.id, { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, { new: true }).exec();
                            if (utils_1.utils.verifyCond(user)) {
                                if ("img" in userFilter) {
                                    const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: userFilter.img });
                                    const filePath = metadata.result.path_lower;
                                    const response = await dropbox.filesGetMetadata({ path: filePath }).then(async () => {
                                        await dropbox.filesDeleteV2({ path: filePath });
                                    }).catch(() => {
                                        throw { msg: "DELETE" };
                                    });
                                }
                                ;
                            }
                            ;
                            return { r: true, data: { url: sharedLink.result.url.replace("?dl=0", "?raw=1"), msg: "Imagem enviada com sucesso!" }, status: common_1.HttpStatus.CREATED };
                        }
                        catch (error) {
                            await this.rabbitMQService.sendToExchange("AICORRIGE", 'KEYAICORRIGE', {
                                dropbox: {
                                    accessToken: response.data.access_token,
                                    clientId: process.env.DROPBOX_CLIENT_ID,
                                    clientSecret: process.env.DROPBOX_CLIENT_SECRET
                                },
                                path: result.result.path_display,
                                userId: verifyToken.user.id,
                                msg: error.msg
                            });
                            return { r: false, data: { url: "", msg: "Imagem armazenada, url em tratativa de erro!" }, status: common_1.HttpStatus.INTERNAL_SERVER_ERROR };
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            catch (error) {
                console.log(error);
                return { r: false, data: { info: utils_1.utils.errorExternalServicesTreatment(error), dropBox: error.response.data, msg: "DropBox error." }, status: common_1.HttpStatus.BAD_REQUEST };
            }
            ;
        }
        ;
        return { r: true, data: { msg: "O login no dropBox é necessário!", url: `https://www.dropbox.com/oauth2/authorize?client_id=${process.env.DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${process.env.DROPBOX_REDIRECT_URI}` }, status: common_1.HttpStatus.ACCEPTED };
    }
    ;
    async editPassword(emailInfo) {
        if (utils_1.utils.verifyCond(emailInfo)) {
            const userFound = await this.userModel.findOne({ "email": emailInfo.email.toLowerCase() })
                .exec();
            const newToken = await this.generateAccessToken({ msg: "Alteração de senha.", type: "access" });
            if (userFound) {
                await this.userModel.findByIdAndUpdate(userFound._id, { $set: {
                        validToken: newToken
                    }
                }, { new: true }).exec();
                return await utils_1.utils.sendEmail(`https://www.google.com.br/?accessToken=${newToken}`, "Alteração de senha.", emailInfo.email);
            }
            else {
                return { r: false, data: { msg: "E-mail não foi encontrado!" }, status: common_1.HttpStatus.BAD_REQUEST };
            }
            ;
        }
        else {
            return { r: false, data: { msg: "E-mail não foi enviado!" }, status: common_1.HttpStatus.BAD_REQUEST };
        }
        ;
    }
    ;
    async refreshToken(refreshToken) {
        const data = await this.verifyRefreshTokenAndGenerateTokens(refreshToken);
        if (data.r) {
            const verifyToken = await this.verifyToken(refreshToken.refreshToken, "refresh");
            const userEdit = await this.userModel.findByIdAndUpdate(verifyToken.user.id, { $set: {
                    validToken: data.data.token
                }
            }, { new: true }).exec();
            if (utils_1.utils.verifyCond(userEdit)) {
                return data;
            }
            ;
        }
        return data;
    }
    ;
    async accessToken(accessToken) {
        const verifyToken = await this.verifyToken(accessToken, "access");
        console.log(verifyToken);
        if (verifyToken instanceof Error) {
            return await this.verifyAccessTokenPass(accessToken);
        }
        ;
        const user = await this.userModel.findById(verifyToken.user.id).exec().then((doc) => doc === null || doc === void 0 ? void 0 : doc.toObject()).catch((err) => err);
        console.log(user);
        if (user && user.validToken == accessToken) {
            return await this.verifyAccessTokenPass(accessToken);
        }
        ;
        return { r: false, data: { msg: "Token inválido!" }, status: common_1.HttpStatus.BAD_REQUEST };
    }
    ;
    async setHash(password) {
        const data = await bcrypt_service_1.BcryptService.hashPassword(password);
        return data;
    }
    ;
    async compareHashedPasswordAndPassword(password, passwordHashed) {
        const data = await bcrypt_service_1.BcryptService.comparePassword(password, passwordHashed);
        return data;
    }
    ;
    async buscaPorEmailDeUsuario(email) {
        if (email != undefined) {
            const filterEmail = email.toLowerCase();
            const usuarioEncontrado = await this.userModel.findOne({ email: filterEmail }).exec();
            if (usuarioEncontrado) {
                return { exist: true };
            }
            ;
            return { exist: false };
        }
        ;
        return { exist: undefined };
    }
    ;
    async buscaPorNomeDeUsuario(username) {
        if (username != undefined) {
            const usuarioEncontrado = await this.userModel.findOne({ username }).exec();
            if (usuarioEncontrado) {
                return { exist: true };
            }
            ;
            return { exist: false };
        }
        ;
        return { exist: undefined };
    }
    ;
};
UsuarioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, rabbitMq_service_1.RabbitMQService])
], UsuarioService);
exports.UsuarioService = UsuarioService;
;
//# sourceMappingURL=user.service.js.map