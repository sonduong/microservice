import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { DatabaseModule } from './database/database.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    DatabaseModule,
    ClientModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
