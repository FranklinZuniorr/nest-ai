import { Controller, Post, Body, Get, Param, HttpStatus, NotFoundException, Query, Header, Headers, UseInterceptors, Req, RawBodyRequest } from '@nestjs/common';
import { NestResponse } from '../core/http/nest-response';
import { NestResponseBuilder } from '../core/http/nest-response-builder';
import { VerifyTokenInterceptor } from 'src/core/http/verify-token-interceptor';
import { PaymentService } from './payment.service';
import bodyParser, { BodyParser } from 'body-parser';

@Controller('stripe')
export class PaymentController {

    constructor(private PaymentService: PaymentService) {};

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
    public async webHookStripe(@Req() req: RawBodyRequest<Request>): Promise<NestResponse> {
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