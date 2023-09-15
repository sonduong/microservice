/* istanbul ignore file */
import { DocumentBuilder } from '@nestjs/swagger';

const swaggerOptions = new DocumentBuilder()
  .setTitle('Client Service')
  .setDescription('APIs for the client service.')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
export = swaggerOptions;
