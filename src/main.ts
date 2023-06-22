import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, accessToken, file, stripe-signature',
  });

  await app.listen(process.env.PORT || 3001);

/*   await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://jacqueline:alura@localhost:5672/`],
      queue: "teste",
      queueOptions: {
        durable: true,
      },
      noAck: false
    },
  })

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://jacqueline:alura@localhost:5672`],
      queue: 'teste',
      queueOptions: {
        durable: true
      },
      noAck: false
    },
  });
 
  app.startAllMicroservices(); */
}
bootstrap();
