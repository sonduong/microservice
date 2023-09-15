/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { Connection } from 'typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { DB_CLIENT } from '../shared/constants';

@Module({
  imports: [],
  providers: [
    {
      provide: PaymentRepository,
      useFactory: (connection: Connection): PaymentRepository =>
        connection.getCustomRepository(PaymentRepository),
      inject: [DB_CLIENT],
    },
    PaymentService,
  ],
  controllers: [PaymentController],
})
export class PaymentModule {}
