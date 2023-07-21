import { HttpStatus } from "@nestjs/common";
import { response } from "src/core/http/responseDto/response";


const nodemailer = require('nodemailer');
const sendinblueTransport = require('nodemailer-sendinblue-transport');
export class utils{
    static errorExternalServicesTreatment(error: any): object{
        return {serviceErrorName: error.name, typeError: error.toString().split(":")[1].trim(), pureError: JSON.stringify(error), msg: error.name};
    };

    static verifyCond = (data) => {
        if(data != undefined && data != "" && data != null && !(data instanceof Error)){
            return true;
        };

        return false;
    };

    static isLinkValid = (link) => {
        const linkRegex = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
        return linkRegex.test(link);
    };

    static sendEmail = async (text, subject, to): Promise<response> => {

        const transporter = new nodemailer.createTransport(
            new sendinblueTransport({
              apiKey: process.env.BREVO_TOKEN,
            })
          );

        /* let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "smtp-relay.sendinblue.com/587",
                pass: "fKqdp1VkxPL5CQGh"
            }
        }); */

        let html = `
            <span h3>Alterar senha:</span>
            <a href="${text}">Clique aqui para alterar!</a>
        `;

        let mailOptions = {
            from: process.env.BREVO_EMAIL,
            to: to.toLowerCase(),
            subject: subject,
            html
        };

        try {
            const response = await transporter.sendMail(mailOptions);
            return {r: true, data: {response, msg: "E-mail enviado com sucesso!"}, status: HttpStatus.OK}
        } catch (error) {
            return {r: false, data: {error: utils.errorExternalServicesTreatment(error), msg: "Erro ao enviar e-mail, tente em outro momento!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
        };
    };
};