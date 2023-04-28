import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';

@Controller('ai')
export class AiController {

    constructor(private aiService: AiService) {}

    @Get()
    public async getAiResponse(@Body() text: Ai, @Headers('perm') perm: string): Promise <NestResponse> {

        console.log(perm)
        
        const data = await this.aiService.solicitarAi(text, null);
        console.log(data)
        return new NestResponseBuilder()
                .comStatus(HttpStatus.CREATED)
                .comBody(data)
                .build();
    }

    @Get("/qs")
    public async getAiReponseQs(@Query("msg") text: string): Promise <NestResponse> {
        
        const data = await this.aiService.solicitarAi(null, text);
        console.log(data)
        return new NestResponseBuilder()
                .comStatus(HttpStatus.CREATED)
                .comBody(data)
                .build();
    }
}