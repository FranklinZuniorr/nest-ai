import { HttpStatus, Injectable } from '@nestjs/common';
import { Ai } from './ai.entity';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';

import { utils } from 'src/utils/utils';
import { UsuarioService } from 'src/usuario/user.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { AiJson } from './ai..json.entity';
require("dotenv").config();

const jwtService = new JwtService();
@Injectable()
export class AiService extends AuthService{

    constructor(public usuarioService: UsuarioService, @InjectModel(User.name) private userModel: Model<User>){
        super(jwtService)
    }

    public async callAi(text: Ai, accessToken: string): Promise<any> {

        const verifyToken = await this.verifyToken(accessToken, "access");

        const userFound = await this.userModel.findById(verifyToken.user.id)
        .exec();

        const { coins } = userFound.toObject();

        if(coins > 0){
            const apiKey = process.env.OPENAI_API_KEY;
            const baseURL = "https://api.openai.com/v1";
    
            const openai = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            });
            
            let prompt = text.msg;
    
            const model = "text-davinci-003";
            const maxTokens = 2000;
            const temperature = 1;
    
            const data = {
            prompt,
            model,
            max_tokens: maxTokens,
            temperature,
            };
    
            const dataRes = openai
            .post("/completions", data)
            .then(async (response) => {
                const answer = response.data.choices[0].text.trim();
                const user = await this.userModel.findByIdAndUpdate(
                    verifyToken.user.id,
                    { $inc: {
                        coins: -1
                      }
                    },
                    { new: true }
                ).exec();
                return {r: true, data: answer, status: HttpStatus.OK};
            })
            .catch((error) => {
                return {r: false, data: {info: utils.errorExternalServicesTreatment(error), msg: "OpenAi error."}, status: HttpStatus.INTERNAL_SERVER_ERROR};
            });
    
            return dataRes;
        }else{
            return {r: false, data: {msg: "Tickets insuficientes!"}, status: HttpStatus.BAD_REQUEST};
        };

    };

    public async callAiJson(req: AiJson, accessToken: string): Promise<any>{
        console.log(req)
        const verifyToken = await this.verifyToken(accessToken, "access");

        const userFound = await this.userModel.findById(verifyToken.user.id)
        .exec();

        const { coins } = userFound.toObject();

        if(coins > 0){
            const apiKey = process.env.OPENAI_API_KEY;
            const baseURL = "https://api.openai.com/v1/chat";
            const criteria = "* Competência 5: Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos, no final da redação. => 200: Consegue apresentar proposta detalhada, coerente e relacionada à argumentação desenvolvida na redação. 160: Apresenta proposta relacionada ao tema e articulada com a argumentação desenvolvida. 120: Proposta de intervenção mediana, mas articulada com a argumentação desenvolvida no texto. 80: Proposta insatisfatória ou não articulada com a argumentação desenvolvida. 40: Proposição vaga ou simplesmente citada. 0: Ausência de proposta de intervenção ou sem relação com o tema. ENTRE ESSAS NOTAS, QUAL NOTA PODE SER ATRIBUIDA A CONCLUSÃO (parágrafo final, último elemento entre introdução, desenvolvimento e conclusão) DA REDAÇÃO A SEGUIR?";
    
            const openai = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            timeout: 6000000
            });

            const payload = {
                model: "gpt-3.5-turbo-0613",
                temperature: 1,
                messages: [
                {
                    role: "user",
                    content: req.msg
                },
                ],
                functions: [req.schema],
            };

            const dataRes = openai
            .post("/completions", JSON.stringify(payload))
            .then(async (response) => {
                const answer = "function_call" in response.data.choices[0].message? JSON.parse(response.data.choices[0].message.function_call.arguments):
                response.data.choices[0].message.content;
                if("function_call" in response.data.choices[0].message){
                    const user = await this.userModel.findByIdAndUpdate(
                        verifyToken.user.id,
                        { $inc: {
                            coins: -1
                          }
                        },
                        { new: true }
                    ).exec();
                    return {r: true, data: {usage: response.data.usage, answer: answer, msg: "OpenAi ok!"}, status: HttpStatus.OK};
                };
                return {r: false, data: {usage: response.data.usage, answer: answer, msg: "OpenAi error."}, status: HttpStatus.BAD_REQUEST};

            })
            .catch((error) => {
                return {r: false, data: {info: utils.errorExternalServicesTreatment(error), msg: "OpenAi error."}, status: HttpStatus.INTERNAL_SERVER_ERROR};
            });
    
            return dataRes;
            
        }else{
            return {r: false, data: {msg: "Tickets insuficientes!"}, status: HttpStatus.BAD_REQUEST};
        };
    };
};