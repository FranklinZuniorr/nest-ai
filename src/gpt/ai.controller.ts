import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers, UseInterceptors } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';
import { AiJson } from './ai..json.entity';

@Controller('ai')
export class AiController {

    constructor(private aiService: AiService) {};

    @Get()
    @UseInterceptors(VerifyTokenInterceptor)
    public async getAiResponse(@Body() text: Ai, @Headers('accessToken') accessToken: string): Promise <NestResponse> {

        const response = await this.aiService.callAi(text, accessToken);
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();
        
    };

    @Get("json")
    @UseInterceptors(VerifyTokenInterceptor)
    public async getAiResponseJson(@Body() req: AiJson, @Headers('accessToken') accessToken: string): Promise<NestResponse>{

        const response = await this.aiService.callAiJson(req, accessToken);
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();

    };

};