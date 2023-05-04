import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';

@Controller('ai')
export class AiController {

    constructor(private aiService: AiService) {}

    @Get()
    public async getAiResponse(@Body() text: Ai, @Headers('accessToken') accessToken: string): Promise <NestResponse> {

        const dataVerifyAccessToken = await this.aiService.verifyAccessTokenPass(accessToken);

        if(dataVerifyAccessToken.r){
            const response = await this.aiService.solicitarAi(text, null);
            return new NestResponseBuilder()
            .comStatus(response.status)
            .comBody(response.data)
            .build();
        }

        return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build();
        
    }

    @Get("/qs")
    public async getAiReponseQs(@Query("msg") text: string, @Headers('perm') perm: string): Promise <NestResponse> {
        
        const data = await this.aiService.solicitarAi(null, text);
        console.log(data)
        return new NestResponseBuilder()
                .comStatus(HttpStatus.OK)
                .comBody(data)
                .build();
    }
}