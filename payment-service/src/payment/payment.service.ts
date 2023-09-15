import {Inject, Injectable, Logger} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {v4 as uuidV4} from 'uuid';
import {OrderDto} from './dto/order.dto';
import {PaymentDto} from './dto/payment.dto';
import {PaymentEntity} from './payment.entity';
import {PaymentRepository} from './payment.repository';
import {PaymentStatus} from '../shared/payment-status.enum';
import {EXISTING_USERS, ORDER_MGMT_MQ, PAYMENT_EVENT} from '../shared/constants';
import {OrderStatus} from '../shared/order-status.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger('PaymentService');

  constructor(
    @Inject(ORDER_MGMT_MQ) private readonly clientProxy: ClientProxy,
    private readonly repository: PaymentRepository,
  ) {}

  async initiatePayment(order: OrderDto): Promise<PaymentEntity> {
    if (order.status !== OrderStatus.Created) {
      throw new Error('Order should be created.');
    }

    const payment = new PaymentEntity();
    payment.orderId = order.id;
    payment.userId = order.userId;
    payment.amount = order.amount;
    payment.transactionId = uuidV4();

    const paymentDto = new PaymentDto();
    paymentDto.id = payment.id;
    paymentDto.amount = payment.amount;
    paymentDto.userId = payment.userId;
    paymentDto.orderId = payment.orderId;
    paymentDto.transactionId = payment.transactionId;

    const user = EXISTING_USERS.find(({ id }) => +order.userId === id);
    if (!user || user.balance < payment.amount) {
      payment.status = PaymentStatus.Declined;
      paymentDto.status = payment.status;
      await this.repository.insert(payment);
      this.clientProxy.emit(PAYMENT_EVENT.paymentProcessed, paymentDto);
      return payment;
    }

    const status: PaymentStatus = await (new Promise((resolve) => {
      setTimeout(() => {
        if (order.id % 5 === 0) {
          return resolve(PaymentStatus.Declined);
        }
        return resolve(PaymentStatus.Confirmed);
      }, (Math.floor(Math.random() * 10) + 1) * 3000);
    }));
    payment.status = status;
    await this.repository.insert(payment);
    paymentDto.status = payment.status;

    this.logger.log('Emit paymentProcessed event.');
    this.clientProxy.emit(PAYMENT_EVENT.paymentProcessed, paymentDto);
    return payment;
  }

  async cancelPayment(trxId: string) {
    let payment = await this.repository.findOne({ where: { transactionId: trxId }});
    if (payment.status === PaymentStatus.Confirmed) {
      payment.status = PaymentStatus.Declined;
      payment = await this.repository.save(payment);
    }
    const paymentDto = new PaymentDto();
    paymentDto.id = payment.id;
    paymentDto.amount = payment.amount;
    paymentDto.userId = payment.userId;
    paymentDto.orderId = payment.orderId;
    paymentDto.status = payment.status;
    paymentDto.transactionId = payment.transactionId;

    this.logger.log('Emit paymentProcessed event.');
    this.clientProxy.emit(PAYMENT_EVENT.paymentProcessed, paymentDto);
  }
}
