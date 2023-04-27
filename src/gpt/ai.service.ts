import { Injectable } from '@nestjs/common';
import { Ai } from './ai.entity';
const axios = require("axios");
require("dotenv").config();

@Injectable()
export class AiService {

    public solicitarAi(text: Ai): any {

        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = "https://api.openai.com/v1";

        const openai = axios.create({
        baseURL,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        });

        const prompt = text.msg;
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
            return {
                r: true,
                data: answer
            }
        })
        .catch((error) => {
            return {
                r: false,
                data: error
            }
        });

        return dataRes

    }
}