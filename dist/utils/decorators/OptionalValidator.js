"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalValidator = exports.OptionalValidatorConstraint = void 0;
const class_validator_1 = require("class-validator");
let OptionalValidatorConstraint = class OptionalValidatorConstraint {
    async validate(value, args) {
        if (value !== undefined) {
            const [object, propertyName] = args.constraints;
            const validator = new (args.constraints[2])();
            return validator.validate(value);
        }
        return true;
    }
};
OptionalValidatorConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: true })
], OptionalValidatorConstraint);
exports.OptionalValidatorConstraint = OptionalValidatorConstraint;
function OptionalValidator(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            propertyName,
            options: validationOptions,
            target: object.constructor,
            constraints: [object, propertyName, ...((validationOptions === null || validationOptions === void 0 ? void 0 : validationOptions.each) ? [validationOptions.each] : [])],
            validator: OptionalValidatorConstraint,
        });
    };
}
exports.OptionalValidator = OptionalValidator;
//# sourceMappingURL=OptionalValidator.js.map