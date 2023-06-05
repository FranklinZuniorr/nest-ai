/// <reference types="mongoose/types/models" />
import { Model } from 'mongoose';
import { User } from 'src/mongoDb/user.schema';
export declare class RabbitMQService {
    private userModel;
    constructor(userModel: Model<User>);
    sendToExchange(exchangeName: string, routingKey: string, message: object): Promise<void>;
    rabbitMqConsumeErrosUploadImage(): Promise<void>;
}
