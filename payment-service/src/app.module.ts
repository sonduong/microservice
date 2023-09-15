import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { ClientModule } from './client/client.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ClientModule,
    DatabaseModule,
    PaymentModule,
  ],
  providers: [ConfigService],
  controllers: [],
})
export class AppModule {}
