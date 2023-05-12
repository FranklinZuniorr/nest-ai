import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, Transport, ClientProxy, MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import amqp from 'amqp-connection-manager';
import { connect, Channel } from 'amqplib';

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

  async sendToExchange(exchangeName: string, routingKey: string, message: string) {
    const connection = await connect(`amqp://jacqueline:alura@localhost:5672`);
    const channel = await connection.createChannel();
  
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify({data: message})));
  
    await channel.close();
    await connection.close();
  }
}

async function consumeFromExchange() {
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

}

consumeFromExchange();