import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/usuario/accessTokenAndRefreshToken/AuthService';

import { utils } from 'src/utils/utils';
import { UsuarioService } from 'src/usuario/user.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/mongoDb/user.schema';
import { Model } from 'mongoose';
import { capturePayment, createOrder } from './payPal.utils';
require("dotenv").config();

const jwtService = new JwtService();
@Injectable()
export class PayPalService extends AuthService{

    constructor(@InjectModel(User.name) private userModel: Model<User>){
        super(jwtService)
    }

    public async setPayPalOrderIdCapture(orderID: string, accessToken: string): Promise<any>{
        try {
            const response = await capturePayment(orderID);

            const verifyToken = this.verifyToken(accessToken, "access");

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

    };
};