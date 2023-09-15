import {Inject, Injectable, Logger} from '@nestjs/common';
import {ClientProxy} from '@nestjs/microservices';
import {CreateOrderDto} from './dto/create-order.dto';
import {OrderRepository} from './order.repository';
import {OrderEntity} from './order.entity';
import {OrderDto} from './dto/order.dto';
import {ORDER_MGMT_MQ, PAYMENT_EVENT} from '../shared/constants';
import {PaymentDto} from './dto/payment.dto';
import {PaymentStatus} from '../shared/payment-status.enum';
import {OrderStatus} from '../shared/order-status.enum';

@Injectable()
export class OrderService {
  private readonly logger = new Logger('OrderService');

  constructor(
    private readonly repository: OrderRepository,
    @Inject(ORDER_MGMT_MQ) private readonly clientProxy: ClientProxy,
  ) {}

  async findAll(): Promise<OrderEntity[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<OrderEntity> {
    const orders = await this.repository.findByIds([id]);
    if (orders.length === 0) {
      return;
    }
    return orders[0];
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const order = new OrderEntity();
    order.userId = createOrderDto.userId;
    order.amount = createOrderDto.amount;
    const result = await this.repository.insert(order);
    return this.findById(+result.identifiers[0].id);
  }

  async updateOrderStatus(payment: PaymentDto): Promise<OrderEntity> {
    if (!payment.orderId) {
      throw new Error('Invalid payment.');
    }
    const order = await this.findById(payment.orderId);
    if (!order) {
      throw new Error('Invalid order.');
    }

    if (payment.status === PaymentStatus.Confirmed) {
      order.status = OrderStatus.Confirmed;
    } else if (payment.status === PaymentStatus.Declined) {
      order.status = OrderStatus.Canceled;
    } else {
      throw new Error('Invalid payment status.');
    }

    order.transactionId = payment.transactionId;
    order.updatedAt = new Date();
    return this.repository.save(order);
  }

  async cancel(orderId: number): Promise<OrderEntity> {
    const order = await this.findById(orderId);
    if (order.status === OrderStatus.Delivered) {
      throw new Error('Can not cancel delivered order.');
    }

    if (order.status === OrderStatus.Canceled) {
      return order;
    }

    order.status = OrderStatus.Canceled;
    return this.repository.save(order);
  }

  async initiatePayment(id: number) {
    const order = await this.findById(id);
    this.logger.log('Emit paymentInitiated event.');
    this.clientProxy.emit(PAYMENT_EVENT.paymentInitiated, new OrderDto(order.id, order.amount, order.userId, order.status));
  }

  async cancelPayment(order: OrderEntity) {
    if (order.status === OrderStatus.Delivered) {
      throw new Error('Order can not be canceled after delivery.');
    }
    if (order.status === OrderStatus.Canceled) {
      return;
    }

    this.logger.log('Emit paymentCanceled event.');
    this.clientProxy.emit(PAYMENT_EVENT.paymentCanceled, order.transactionId);
  }

  async deliver(id: number): Promise<void> {
    const order = await this.findById(id);
    if (order.status !== OrderStatus.Confirmed) {
      throw new Error('Order should be confirmed before delivery.');
    }

    order.status = OrderStatus.Delivered;
    await this.repository.save(order);
  }
}
