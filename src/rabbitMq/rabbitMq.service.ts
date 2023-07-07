import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, Transport, ClientProxy, MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import amqp from 'amqp-connection-manager';
import { connect, Channel } from 'amqplib';
import * as Dropbox from 'dropbox';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from 'src/mongoDb/user.schema';
import { utils } from 'src/utils/utils';

@Injectable()
export class RabbitMQService {
/*   private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://jacqueline:alura@localhost:5672`],
        queue: 'teste',
        queueOptions: {
          durable: true,
        },
        noAck: false
      },
    });
  }

  async sendMessage(message: any): Promise<void> {
    const result = await this.client.emit('teste', JSON.stringify({data: message}));
    await result.subscribe()
  } */

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.rabbitMqConsumeErrosUploadImage();
  };

  async sendToExchange(exchangeName: string, routingKey: string, message: object) {
    const connection = await connect(process.env.RABBIT_URL);
    const channel = await connection.createChannel();
  
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify({data: message})));
  
    await channel.close();
    await connection.close();
  };

  async rabbitMqConsumeErrosUploadImage(){
    /* const userModel: ReturnModelType<typeof User> = getModelForClass(User);
    const rabbitMQService = new RabbitMQService(); */
    const exchangeName = 'AICORRIGEAPI';
    const queueName = 'QUEUEAICORRIGEAPI';
    const routingKey = 'KEYAICORRIGEAPI';
    const connection = await connect(process.env.RABBIT_URL);
    const channel = await connection.createChannel();
  
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);
  
    await channel.consume(queueName, async (message) => {
      console.log(message)
      const data = JSON.parse(message.content.toString());
      console.log(data.data);
  
      channel.ack(message);
  
      if (Object.keys(data.data.dropbox).length > 0) {
        const dropbox = new Dropbox.Dropbox({
          accessToken: data.data.dropbox.accessToken,
          clientId: data.data.dropbox.clientId,
          clientSecret: data.data.dropbox.clientSecret
        });

        if(data.data.msg == "GENERATE"){
  
          const sharedLink = await dropbox.sharingCreateSharedLinkWithSettings({
            path: data.data.path,
          });
  
          const userFilter = await this.userModel.findById(data.data.userId).exec().then((doc) => doc?.toObject()).catch((err) => err);
  
          const user = await this.userModel.findByIdAndUpdate(data.data.userId, 
              { $set: { img: sharedLink.result.url.replace("?dl=0", "?raw=1") } }, 
              { new: true }).exec();
  
          if(utils.verifyCond(user)){
            if("img" in userFilter && userFilter.img != ""){
              const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: userFilter.img });
              const filePath = metadata.result.path_lower;
              await dropbox.filesDeleteV2({ path: filePath });
            };
          };
  
            console.log("Rabbit_fix------------")
            console.log(user)
            console.log("Rabbit_fix------------")
        }else if(data.data.msg == "DELETE"){
          const metadata = await dropbox.sharingGetSharedLinkMetadata({ url: data.data.oldLinkImg });
          const filePath = metadata.result.path_lower;
          const response = await dropbox.filesGetMetadata({ path: filePath }).then(async () => {
              await dropbox.filesDeleteV2({ path: filePath });
          })

          console.log("Rabbit_fix_delete------------")
        }
      };
    });
  };

}

/* async function consumeFromExchange() {
  const exchangeName = 'testeex';
  const queueName = 'teste';
  const routingKey = 'teste';
  const connection = await connect(`amqp://jacqueline:alura@localhost:5672`);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, 'direct', { durable: true });
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, routingKey);

  await channel.consume(queueName, async (message) => {
    if (message !== null) {
      // Processa a mensagem aqui
      console.log(JSON.parse(message.content.toString()))

      // Confirma o recebimento da mensagem após o processamento
      channel.ack(message);
    }
  });

} */