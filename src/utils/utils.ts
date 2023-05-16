import { HttpStatus } from "@nestjs/common";
import { response } from "src/core/http/responseDto/response";


const nodemailer = require('nodemailer');
const sendinblueTransport = require('nodemailer-sendinblue-transport');
export class utils{
    static errorExternalServicesTreatment(error: any): object{
        return {serviceErrorName: error.name, typeError: error.toString().split(":")[1].trim()};
    };

    static verifyCond = (data) => {
        if(data != undefined && data != "" && data != null){
            return true;
        };

        return false;
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

        let mailOptions = {
            from: process.env.BREVO_EMAIL,
            to: to.toLowerCase(),
            subject: subject,
            text: text
        };

        try {
            const response = await transporter.sendMail(mailOptions);
            return {r: true, data: {response, msg: "E-mail enviado com sucesso!"}, status: HttpStatus.OK}
        } catch (error) {
            return {r: false, data: {error: utils.errorExternalServicesTreatment(error), msg: "Erro ao enviar e-mail!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
        };
    };
};