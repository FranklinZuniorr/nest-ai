import { HttpStatus } from "@nestjs/common";
import { response } from "src/responseDto/response";

const nodemailer = require('nodemailer');
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
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        let mailOptions = {
            from: 'franklin.vieira@querodelivery.com',
            to: to.toLowerCase(),
            subject: subject,
            text: text
        };

        const response = await transporter.sendMail(mailOptions);

        if(response){
            return {r: true, data: {response, msg: "E-mail enviado com sucesso!"}, status: HttpStatus.OK}
        }else{
            return {r: false, data: {error: utils.errorExternalServicesTreatment(response), msg: "Erro ao enviar e-mail!"}, status: HttpStatus.INTERNAL_SERVER_ERROR}
        };
    };
};