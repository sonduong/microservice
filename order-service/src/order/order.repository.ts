import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { OrderEntity } from './order.entity';

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {
  private readonly logger = new Logger('OrderRepository');
}
