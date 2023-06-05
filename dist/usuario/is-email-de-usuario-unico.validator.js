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
exports.IsEmailDeUsuarioUnico = exports.IsEmailDeUsuarioUnicoConstraint = void 0;
const class_validator_1 = require("class-validator");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
let IsEmailDeUsuarioUnicoConstraint = class IsEmailDeUsuarioUnicoConstraint {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    validate(emailDeUsuario, validationArguments) {
        console.log(!!!this.usuarioService.buscaPorEmailDeUsuario(emailDeUsuario));
        return !!!this.usuarioService.buscaPorEmailDeUsuario(emailDeUsuario);
    }
};
IsEmailDeUsuarioUnicoConstraint = __decorate([
    (0, common_1.Injectable)(),
    (0, class_validator_1.ValidatorConstraint)(),
    __metadata("design:paramtypes", [user_service_1.UsuarioService])
], IsEmailDeUsuarioUnicoConstraint);
exports.IsEmailDeUsuarioUnicoConstraint = IsEmailDeUsuarioUnicoConstraint;
function IsEmailDeUsuarioUnico(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailDeUsuarioUnicoConstraint,
        });
    };
}
exports.IsEmailDeUsuarioUnico = IsEmailDeUsuarioUnico;
//# sourceMappingURL=is-email-de-usuario-unico.validator.js.map