/* istanbul ignore file */
import * as dotenv from 'dotenv';
import { ConnectionOptions } from 'typeorm';
import { Global } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import * as dbConfig from './database.config';

@Global()
export class ConfigService {
  constructor() {
    dotenv.config();
  }

  get redisConfig(): any {
    return {
      transport: Transport.REDIS,
      options: {
        url: process.env.REDIS_CONNECTION_STRING || 'redis://localhost:6379',
        retryAttempts: process.env.REDIS_RETRY || 0,
        retryDelay: process.env.REDIS_RETRY_DELAY || 0,
      },
    };
  }

  get databaseConfig(): ConnectionOptions {
    return (dbConfig as ConnectionOptions);
  }
}
