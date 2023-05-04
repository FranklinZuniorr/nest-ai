import { HttpStatus, Injectable } from '@nestjs/common';
import { Ai } from './ai.entity';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';
import { JwtService } from '@nestjs/jwt';
const axios = require("axios");
require("dotenv").config();

const jwtService = new JwtService();
@Injectable()
export class AiService extends AuthService {

    constructor(){
        super(jwtService)
    }

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

        if(text != null){
            prompt = text.msg
        }

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
            return {r: false, data: "Erro na solicitação da AI.", status: HttpStatus.BAD_REQUEST}
        });

        return dataRes

    }
}