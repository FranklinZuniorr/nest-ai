import { HttpStatus } from "@nestjs/common";
import { response } from "src/core/http/responseDto/response";
import * as fs from 'fs';
import { promisify } from 'util';

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

    static verifyQuestion = (data, textProp = "", textProp2 = "") => {

        const dataFilter = textProp2 !== ""? data[textProp][textProp2]:data[textProp];

        if(dataFilter != undefined && dataFilter != "" && dataFilter != null){
            return dataFilter
        }else{
            return "-"
        }

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

        let html = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <title>Alterar senha</title>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
        </head>
        <body>
            <header style="
                border: 1px solid #d6d6d6;
                padding: 1rem;
            ">
                <div style="
                    display: flex;
                ">
                    <img src="https://aicorrige.com/static/media/blackLogo.220c916b113fc9049dd8.png" style="
                        width: 64px;
                        height: 64px;
                        margin-right: 1rem;
                    "/>
                    <br/>
                    <div style="
                        text-align: left;
                        margin-top: 10px;
                    ">
                        <span style="
                            font-style: normal;
                            font-size: 1.3rem;
                            font-variant-caps: small-caps;
                        ">
                            Ai corrige
                        </span>
                        <br/>
                        <span style="
                            font-style: normal;
                            font-size: 0.7rem;
                            font-variant-caps: small-caps;
                        ">
                            Plataforma de aprendizado virtual com o uso de inteligência artificial.
                        </span>
                    </div>
                </div>
            </header>
            <section style="
                border: 1px solid #d6d6d6;
                margin-top: 0.4rem;
                padding: 1rem;
            ">
                <div style="
                    margin-bottom: 0.5rem;
                    font-size: 20px;
                ">
                    Alteração de senha:
                </div>
                <a href="${text}" style="
                    font-size: 14px;
                ">
                    Alterar agora
                </a>
            </section>
        </body>
        </html>`;

        let mailOptions = {
            from: process.env.BREVO_EMAIL,
            to: to.toLowerCase(),
            subject: subject,
            html: html
        };

        try {
            const response = await transporter.sendMail(mailOptions);
            return {r: true, data: {response, msg: "E-mail enviado com sucesso!"}, status: HttpStatus.OK}
        } catch (error) {
            return {r: false, data: {error: utils.errorExternalServicesTreatment(error), msg: "Erro ao enviar e-mail, tente em outro momento!"}, status: HttpStatus.INTERNAL_SERVER_ERROR};
        };
    };
};