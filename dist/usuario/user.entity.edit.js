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
exports.UserEdit = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UserEdit {
}
__decorate([
    (0, class_transformer_1.Expose)({
        name: 'email'
    }),
    (0, class_validator_1.IsEmail)({}, {
        message: 'E-mail precisa ser um endereço de email válido.'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserEdit.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)({
        name: 'username'
    }),
    __metadata("design:type", String)
], UserEdit.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)({
        name: 'password'
    }),
    (0, class_transformer_1.Exclude)({
        toPlainOnly: true
    }),
    (0, class_validator_1.Matches)(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e 8 caracteres ao todo.'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UserEdit.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Expose)({
        name: 'coins'
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserEdit.prototype, "coins", void 0);
exports.UserEdit = UserEdit;
;
//# sourceMappingURL=user.entity.edit.js.map