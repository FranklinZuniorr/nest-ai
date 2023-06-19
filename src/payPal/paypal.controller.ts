import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers, UseInterceptors } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';
import { PayPalService } from './paypal.service';

@Controller('orders')
export class PayPalController {

    constructor(private PayPalService: PayPalService) {};

    @Post(":orderID/capture")
    @UseInterceptors(VerifyTokenInterceptor)
    public async postOrderIDCapture(@Param("orderID") orderID: string, @Headers('accessToken') accessToken: string): Promise <NestResponse> {

        const response = await this.PayPalService.setPayPalOrderIdCapture(orderID, accessToken);
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();
    };

    @Post()
    @UseInterceptors(VerifyTokenInterceptor)
    public async postOrders(@Headers('accessToken') accessToken: string): Promise <NestResponse> {

        const response = await this.PayPalService.setPayPalOrders();
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();
    };
};