"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require('nodemailer');
const sendinblueTransport = require('nodemailer-sendinblue-transport');
class utils {
    static errorExternalServicesTreatment(error) {
        return { serviceErrorName: error.name, typeError: error.toString().split(":")[1].trim() };
    }
    ;
}
exports.utils = utils;
_a = utils;
utils.verifyCond = (data) => {
    if (data != undefined && data != "" && data != null && !(data instanceof Error)) {
        return true;
    }
    ;
    return false;
};
utils.sendEmail = async (text, subject, to) => {
    const transporter = new nodemailer.createTransport(new sendinblueTransport({
        apiKey: process.env.BREVO_TOKEN,
    }));
    let mailOptions = {
        from: process.env.BREVO_EMAIL,
        to: to.toLowerCase(),
        subject: subject,
        text: text
    };
    try {
        const response = await transporter.sendMail(mailOptions);
        return { r: true, data: { response, msg: "E-mail enviado com sucesso!" }, status: common_1.HttpStatus.OK };
    }
    catch (error) {
        return { r: false, data: { error: utils.errorExternalServicesTreatment(error), msg: "Erro ao enviar e-mail!" }, status: common_1.HttpStatus.INTERNAL_SERVER_ERROR };
    }
    ;
};
;
//# sourceMappingURL=utils.js.map