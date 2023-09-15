import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';

@EntityRepository(PaymentEntity)
export class PaymentRepository extends Repository<PaymentEntity> {
  private readonly logger = new Logger('PaymentRepository');
}
