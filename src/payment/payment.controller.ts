import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers, UseInterceptors, Req } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';
import { PaymentService } from './payment.service';
import bodyParser from 'body-parser';

@Controller('stripe')
export class PaymentController {

    constructor(private PaymentService: PaymentService) {};

    /* @Post(":orderID/capture")
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
    }; */

    @Post("create-checkout-session")
    @UseInterceptors(VerifyTokenInterceptor)
    public async createCheckoutSession(@Headers('accessToken') accessToken: string): Promise<NestResponse> {
        const response = await this.PaymentService.newCheckoutSession(accessToken);
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();
    };

    @Post("webhook")
    public async webHookStripe(@Req() req: Request): Promise<NestResponse> {
        const response = await this.PaymentService.newWebHookStripe(req);
        return new NestResponseBuilder()
        .comStatus(response.status)
        .comHeaders({
            'Info': response.r
        })
        .comBody(response)
        .build();
    };
};