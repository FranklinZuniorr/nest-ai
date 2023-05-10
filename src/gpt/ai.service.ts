import { HttpStatus, Injectable } from '@nestjs/common';
import { Ai } from './ai.entity';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
import { utils } from 'src/utils/utils';
import { UsuarioService } from 'src/usuario/usuario.service';
import axios from 'axios';
require("dotenv").config();
@Injectable()
export class AiService{

    constructor(public usuarioService: UsuarioService){}

    public async solicitarAi(text: Ai, textQs: string): Promise<any> {

        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = "https://api.openai.com/v1";

        const openai = axios.create({
        baseURL,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        });
        
        let prompt = textQs;

        if(utils.verifyCond(text)){
            prompt = text.msg
        };

        const model = "text-davinci-003";
        const maxTokens = 500;
        const temperature = 1;

        const data = {
        prompt,
        model,
        max_tokens: maxTokens,
        temperature,
        };

        const dataRes = openai
        .post("/completions", data)
        .then((response) => {
            const answer = response.data.choices[0].text.trim();
            return {r: true, data: answer, status: HttpStatus.OK}
        })
        .catch((error) => {
            return {r: false, data: {info: utils.errorExternalServicesTreatment(error), msg: "OpenAi error."}, status: HttpStatus.INTERNAL_SERVER_ERROR}
        });

        return dataRes;
    };
};