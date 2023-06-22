import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';

import { utils } from 'src/utils/utils';
import { UsuarioService } from 'src/usuario/user.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { capturePayment, createOrder } from './payment.utils';
const stripe = require('stripe')('sk_test_51NLXcZCRHbMqiuoDKuhCBqxz2tyrCXcvhzQNDENNIDcT8TZwDHcKjTMmrcT5G6GKs5OcISf2x9btKdu1JBvuaaQS005bVUh6j1');
require("dotenv").config();

const jwtService = new JwtService();
@Injectable()
export class PaymentService extends AuthService{

    constructor(@InjectModel(User.name) private userModel: Model<User>){
        super(jwtService)
    }

    public async newCheckoutSession(accessToken: string): Promise<any> {

        const verifyToken = await this.verifyToken(accessToken, "access");

        const { id } = verifyToken.user;

        const YOUR_DOMAIN = 'http://localhost:3001';

        let session = await stripe.checkout.sessions.create({
            line_items: [
              {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: 'price_1NLlRDCRHbMqiuoDsIAZWrdV',
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}?success=true`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
        });

        session = {...session, id_mongo: id}

        console.log(session)
        return {r: true, data: {msg: "Checkout criado!", res: session}, status: HttpStatus.ACCEPTED};
        
    };

    public async newWebHookStripe(request: Request): Promise<any> {

        const endpointSecret = process.env.STRIPE_ENDPOINT_CONFIRM_PAYMENT_SECRET;
        const fulfillOrder = (lineItems) => {
        // TODO: fill me in
        console.log("Fulfilling order", lineItems);
        }

        const payload = request.body;
        const sig = request.headers['stripe-signature'];
        
        let event;
      
        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } catch (err) {
            return {r: false, data: {msg: "Webhook Error!", res: err.message}, status: HttpStatus.BAD_REQUEST};
        }
      
        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
          // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            {
              expand: ['line_items'],
            }
          );
          const lineItems = sessionWithLineItems.line_items;
      
          // Fulfill the purchase...
          fulfillOrder(lineItems);
        }
      
        return {r: true, data: {msg: "Webhook ok!"}, status: HttpStatus.OK};
    };

    /* public async setPayPalOrderIdCapture(orderID: string, accessToken: string): Promise<any>{
        try {
            const response = await capturePayment(orderID);

            const verifyToken = await this.verifyToken(accessToken, "access");

            const { id } = verifyToken.user;
            
            const user = await this.userModel.findByIdAndUpdate(
                id,
                { $inc: {
                    coins: 10
                  }
                }
            ).exec();

            return {r: true, data: {msg: "Pagamento capturado!", res: response}, status: HttpStatus.ACCEPTED};
        } catch (error){
            return {r: false, data: {msg: "Failed to capture order!", info: utils.errorExternalServicesTreatment(error)}, status: HttpStatus.INTERNAL_SERVER_ERROR};
        };
    };

    public async setPayPalOrders(): Promise<any> {

        try{
            const response = await createOrder();
            return {r: true, data: {msg: "Ordem criada!", res: response}, status: HttpStatus.ACCEPTED};
        } catch(error) {
            return {r: false, data: {msg: "Failed to create order!", info: utils.errorExternalServicesTreatment(error)}, status: HttpStatus.INTERNAL_SERVER_ERROR};
        }

    }; */
};