import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

const logger = new Logger('Order Main');

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
  const options = new DocumentBuilder()
    .setTitle('Orders Service')
    .setDescription('APIs usage')
    .setVersion('1.0')
    .addTag('orders')
    // .setBasePath('/')
    // .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Order service is listening port ${port}...`);
}

bootstrap();
