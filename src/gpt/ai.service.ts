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
import { AiJson, AiJsonArray } from './ai..json.entity';
import { env } from 'process';
import { RabbitMQService } from 'src/rabbitMq/rabbitMq.service';
import * as moment from "moment";
import { Spending } from 'src/mongoDb/spending.schema';
import { Themes } from 'src/mongoDb/themes.schema';
require("dotenv").config();

const jwtService = new JwtService();
@Injectable()
export class AiService extends AuthService{

    constructor(
        public usuarioService: UsuarioService, 
        @InjectModel(User.name) private userModel: Model<User>, 
        private rabbitMQService: RabbitMQService,
        @InjectModel(Spending.name) private spendingModel: Model<Spending>,
        @InjectModel(Themes.name) private themesModel: Model<Themes>
    ){
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

    public async callAiJson(req: AiJsonArray, accessToken: string): Promise<any>{
        console.log(req)
        const verifyToken = await this.verifyToken(accessToken, "access");

        const userFound = await this.userModel.findById(verifyToken.user.id)
        .exec();

        const { coins } = userFound.toObject();

        if(coins > 0){

            const callApiOpenAi = async (req: AiJson) => {
                const apiKey = process.env.OPENAI_API_KEY;
                const baseURL = "https://api.openai.com/v1/chat";
        
                const openai = axios.create({
                baseURL,
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                }
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
                    response.data;
                    if("function_call" in response.data.choices[0].message){
                        return {r: true, data: {usage: response.data.usage, answer: answer, title: req.title}, status: HttpStatus.OK};
                    };
                    return {r: false, data: {usage: response.data.usage, answer: answer, title: req.title}, status: HttpStatus.BAD_REQUEST};
                })
                .catch((error) => {
                    return {r: false, data: {info: utils.errorExternalServicesTreatment(error)}, status: HttpStatus.INTERNAL_SERVER_ERROR};
                });
        
                return dataRes;
            };

            const reqs = [];
            let delayTime = 60000/parseInt(process.env.RPM_OPENAI);
            const delay = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            };

            for(var x = 0; x < req.array.length; x++){
                
                await delay(delayTime);
                const response = await callApiOpenAi(req.array[x]); 

                if(response.r == false){
                    return response
                };

                reqs[x] = response.data;
            };

            const user = await this.userModel.findByIdAndUpdate(
                verifyToken.user.id,
                { $inc: {
                    coins: -1
                  }
                },
                { new: true }
            ).exec();

            if(!utils.verifyCond(user)){
                return {r: false, data: {msg: "OpenAi error."}, status: HttpStatus.INTERNAL_SERVER_ERROR};
            }

            return {r: true, data: {reqs: reqs, msg: "OpenAi ok."}, status: HttpStatus.ACCEPTED};
            
        }else{
            return {r: false, data: {msg: "Tickets insuficientes!"}, status: HttpStatus.BAD_REQUEST};
        };
    };

    public async callAiJsonAmqp(req: AiJson, accessToken: string): Promise<any>{
        const verifyToken = await this.verifyToken(accessToken, "access");

        const userFound = await this.userModel.findById(verifyToken.user.id)
        .exec();

        const { coins, _id } = userFound.toObject();
        console.log(_id)

        if(coins > 0){

            this.callWs(req, verifyToken, _id.toString());

            return {r: true, data: {msg: "A atividade está sendo desenvolvida. (:"}, status: HttpStatus.ACCEPTED};

        }else{
            return {r: false, data: {msg: "Tickets insuficientes!"}, status: HttpStatus.BAD_REQUEST};
        };
    };

    async callWs(req, verifyToken, _id){
        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL = "https://api.openai.com/v1/chat";

        const openai = axios.create({
        baseURL,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        timeout: 60000
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

        const dataRes = await openai
        .post("/completions", JSON.stringify(payload))
        .then(async (response) => {
            const answer = "function_call" in response.data.choices[0].message? JSON.parse(response.data.choices[0].message.function_call.arguments):
            response.data;
            if("function_call" in response.data.choices[0].message){
                return {r: true, data: {usage: response.data.usage, answer: answer, title: req.title}, status: HttpStatus.OK, stop: false};
            };
            return {r: false, data: {usage: response.data.usage, answer: answer, title: req.title}, msg: "OpenAi error!", status: HttpStatus.BAD_REQUEST, stop: true};
        })
        .catch((error) => {
            return {r: false, data: {info: utils.errorExternalServicesTreatment(error), msg: "OpenAi error!"}, status: HttpStatus.INTERNAL_SERVER_ERROR, stop: false};
        });

        if(!dataRes.r){
            
            if(dataRes.stop){
                const filterDataRes: any = {...dataRes};
                console.log("error, nó.");
                /* sendMessage(_id, JSON.stringify({r: false, msg: `OpenAi error - ${req.title}`, data: dataRes.data, createdAt: moment().toISOString()})); */
                this.rabbitMQService.sendToExchange("AICORRIGEAPIAI_WS", `KEY.AI.CORRIGE.WS`, {
                    r: false, 
                    msg: `${filterDataRes.data.answer.choices[0]["message"]["content"].slice(0, filterDataRes.data.answer.choices[0]["message"]["content"].length*0.3)}...`, 
                    data: dataRes.data, 
                    createdAt: moment().subtract(3, 'hours').toISOString(),
                    id: _id,
                    event: "open-ai-error"
                });
                /* this.callAmqp(req, verifyToken, _id); */
                
                const user = await this.userModel.findByIdAndUpdate(
                    verifyToken.user.id,
                    { $inc: {
                        coins: -1
                      }
                    },
                    { new: true }
                ).exec();
        
                this.callSpending(dataRes);
            }else{
                this.rabbitMQService.sendToExchange("AICORRIGEAPIAI_WS", `KEY.AI.CORRIGE.WS`, {
                    r: false, 
                    msg: `Não foi possível gerar a atividade no momento.`, 
                    data: dataRes.data, 
                    createdAt: moment().subtract(3, 'hours').toISOString(),
                    id: _id,
                    event: "open-ai-error"
                });
            };

            return
        };

        console.log("Nó passou.")
        const createdAtDate = moment().subtract(3, 'hours').toISOString();

        const options = {
            upsert: true,
            new: true,
        };

        const user = await this.userModel.findByIdAndUpdate(
            verifyToken.user.id,
            { $inc: {
                coins: -1
              }
            },
            { new: true }
        ).exec();

        const findTheme = await this.themesModel.findOne({theme: req.title.trim().replace(/\s/g, "_").toLowerCase()}).exec();

        if(findTheme){
            await this.themesModel.findOneAndUpdate(
                { theme: req.title.trim().replace(/\s/g, "_").toLowerCase() },
                { $inc: { total: 1 } },
                options
            ).exec();
        }else{
            await this.themesModel.findOneAndUpdate(
                { theme: req.title.trim().replace(/\s/g, "_").toLowerCase(), createdAt: createdAtDate },
                { $inc: { total: 1 } },
                options
            ).exec();
        };

        this.callSpending(dataRes);

        const user2 = await this.userModel.findByIdAndUpdate(
        verifyToken.user.id,
            { 
                $push: {
                questions: {data: dataRes, createdAt: createdAtDate, note: req.note}
                }
            }
        ).exec();

        const filter:any = {...dataRes.data}
        delete filter.answer.questao1.alternativa_correta;
        delete filter.answer.questao2.alternativa_correta;
        delete filter.answer.questao3.alternativa_correta;
        delete filter.answer.questao4.alternativa_correta;
        delete filter.answer.questao5.alternativa_correta;
        delete filter.answer.questao1.motivo_alternativa;
        delete filter.answer.questao2.motivo_alternativa;
        delete filter.answer.questao3.motivo_alternativa;
        delete filter.answer.questao4.motivo_alternativa;
        delete filter.answer.questao5.motivo_alternativa;
        dataRes.data = {answer: filter.answer, title: filter.title, usage: filter.usage};

        this.rabbitMQService.sendToExchange("AICORRIGEAPIAI_WS", `KEY.AI.CORRIGE.WS`, {
            r: true, 
            msg: "OpenAi ok!", 
            data: dataRes, 
            createdAt: createdAtDate,
            note: req.note,
            id: _id,
            event: "open-ai-ok"
        });
    };

    async callSpending(dataRes){
        const actualDateMonth = moment().format("MM/YYYY");
        const actualDateDay = moment().format("DD/MM/YYYY");
        const totalSpendingInput = (dataRes.data.usage.prompt_tokens/1000)*parseFloat(process.env.OPENAI_API_PRICE_INPUT);
        const totalSpendingOutput = (dataRes.data.usage.completion_tokens/1000)*parseFloat(process.env.OPENAI_API_PRICE_OUTPUT);
        const totalSpendingInputAndOutput = totalSpendingInput + totalSpendingOutput;

        const options = {
            upsert: true,
            new: true,
        };

        const findMounth = await this.spendingModel.findOne({date: actualDateMonth}).exec()
        .then((doc) => doc?.toObject().spending)
        .catch((err) => err);

        console.log(findMounth)

        if(findMounth != undefined){
            const arr = [...(JSON.parse(JSON.stringify(findMounth)))];

            if(arr[0][actualDateDay]){

                await this.spendingModel.findOneAndUpdate(
                    { date: actualDateMonth },
                    { $inc: { [`spending.${actualDateDay}.totalSpending`]: totalSpendingInputAndOutput, totalSpending: totalSpendingInputAndOutput } },
                    options
                ).exec();

            }else{
                await this.spendingModel.findOneAndUpdate(
                    { date: actualDateMonth },
                    { $inc: { [`spending.${actualDateDay}.totalSpending`]: totalSpendingInputAndOutput, totalSpending: totalSpendingInputAndOutput } },
                    options
                ).exec();
            };
        }else{
            await this.spendingModel.findOneAndUpdate(
                { date: actualDateMonth },
                { $inc: { [`spending.${actualDateDay}.totalSpending`]: totalSpendingInputAndOutput, totalSpending: totalSpendingInputAndOutput } },
                options
            ).exec();
        };
    };
};