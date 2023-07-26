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
import * as moment from "moment";
import { response } from 'src/core/http/responseDto/response';
const stripe = require('stripe')(process.env.STRIPE_SK);
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');

const jwtService = new JwtService();
@Injectable()
export class PaymentService extends AuthService{

    constructor(@InjectModel(User.name) private userModel: Model<User>){
        super(jwtService)
    }

    public async newCheckoutSession(accessToken: string): Promise<any> {

        const verifyToken = await this.verifyToken(accessToken, "access");

        const { id } = verifyToken.user;
        const successId = uuidv4();

        const YOUR_DOMAIN = process.env.STRIPE_DOMAIN;

        let session = await stripe.checkout.sessions.create({
            line_items: [
              {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: process.env.STRIPE_PRICE,
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}?successId=${successId}(!)${id}`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
            client_reference_id: id
        });

        console.log(session)
        return {r: true, data: {msg: "Checkout criado!", res: session}, status: HttpStatus.ACCEPTED};
        
    };

    public async checkPayment(url: string): Promise<response> {

      const id = url.split("(!)")[1];

      console.log(id)
      console.log(url)

      const user: any = (await this.userModel.findById({_id: id})).toObject();
      console.log(user)
      const find = user.shopping.find(pay => pay.data.object.success_url.includes(url));

      console.log(find)
      const indexOf = user.shopping.indexOf(find);

      if(find){

        const userEdit = await this.userModel.findByIdAndUpdate(
          id,
        { 
          $set: {
            [`shopping.${indexOf}.data.object.success_url`]: ""
          }
        }
        ).exec();

        return {r: true, data: {msg: "Pagamento verificado!"}, status: HttpStatus.ACCEPTED};
      };

      return {r: false, data: {msg: "Indisponível!"}, status: HttpStatus.BAD_REQUEST};
    };

    public async newWebHookStripe(request): Promise<any> {

        const endpointSecret = process.env.STRIPE_ENDPOINT_CONFIRM_PAYMENT_SECRET;
        const fulfillOrder = (lineItems) => {
        // TODO: fill me in
        console.log("Fulfilling order", lineItems);
        }

        const payload = request.rawBody;
        const sig = request.headers['stripe-signature'];

        console.log({payload, sig})
        
        let event;
      
        try {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
            console.log("event", event)
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

          const user = await this.userModel.findByIdAndUpdate(
            event.data.object.client_reference_id,
            { $inc: {
                coins: 10
              },
              $push: {
                shopping: {...event, createdAt: moment().subtract(3, 'hours').toISOString()}
              }
            }
            ).exec();
        }
      
        return {r: true, data: {msg: "Webhook ok!"}, status: HttpStatus.OK};
    };
};