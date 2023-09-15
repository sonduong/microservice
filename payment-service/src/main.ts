import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Payment Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_CONNECTION_STRING || 'redis://localhost:6379',
    },
  });

  await app.startAllMicroservicesAsync();

  app.enableCors();
  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.log(`Payment service is listening port ${port}...`);
}

bootstrap();
