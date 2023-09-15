import { createConnection } from 'typeorm';
import { Module, Global } from '@nestjs/common';
import { DB_CLIENT } from '../shared/constants';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [
    ConfigService,
    {
      provide: DB_CLIENT,
      useFactory: async (configService: ConfigService): Promise<any> =>
        await createConnection(configService.databaseConfig),
      inject: [ConfigService],
    }],
  exports: [DB_CLIENT],
})
export class DatabaseModule {}
