import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';

@Controller('ai')
export class AiController {

    constructor(private aiService: AiService) {}

    @Post()
    public async cria(@Body() text: Ai): Promise <NestResponse> {
        
        const data = await this.aiService.solicitarAi(text);
        console.log(data)
        return new NestResponseBuilder()
                .comStatus(HttpStatus.CREATED)
                .comBody(data)
                .build();
    }
}