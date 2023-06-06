import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers, UseInterceptors } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { AiService } from './ai.service';
import { Ai } from './ai.entity';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';

@Controller('ai')
export class AiController {

    constructor(private aiService: AiService) {};

    @Get()
    @UseInterceptors(VerifyTokenInterceptor)
    public async getAiResponse(@Body() text: Ai, @Headers('accessToken') accessToken: string): Promise <NestResponse> {

        /* const dataVerifyAccessToken = await this.aiService.usuarioService.verifyAccessTokenPass(accessToken); */

        /* if(dataVerifyAccessToken.r){ */
            const response = await this.aiService.solicitarAi(text, accessToken);
            return new NestResponseBuilder()
            .comStatus(response.status)
            .comHeaders({
                'Info': response.r
            })
            .comBody(response)
            .build();
        /* }; */

        /* return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build(); */
        
    };

    /* @Get("/qs")
    @UseInterceptors(VerifyTokenInterceptor)
    public async getAiReponseQs(@Query("msg") text: string, @Headers('accessToken') accessToken: string): Promise <NestResponse> { */

        /* const dataVerifyAccessToken = await this.aiService.usuarioService.verifyAccessTokenPass(accessToken); */

        /* if(dataVerifyAccessToken.r){ */
            /* const response = await this.aiService.solicitarAi(null, text);
            return new NestResponseBuilder()
            .comStatus(response.status)
            .comHeaders({
                'Info': response.r
            })
            .comBody(response)
            .build(); */
        /* }; */

        /* return new NestResponseBuilder()
        .comStatus(dataVerifyAccessToken.status)
        .comHeaders({
            'Info': dataVerifyAccessToken.r
        })
        .comBody(dataVerifyAccessToken)
        .build(); */
        
    /* } */
};