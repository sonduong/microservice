import { Connection } from 'typeorm';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRepository } from './order.repository';
import { DB_CLIENT } from '../shared/constants';

@Module({
  imports: [],
  providers: [
    {
      provide: OrderRepository,
      useFactory: (connection: Connection): OrderRepository =>
        connection.getCustomRepository(OrderRepository),
      inject: [DB_CLIENT],
    },
    OrderService,
  ],
  controllers: [OrderController],
})
export class OrderModule {}
