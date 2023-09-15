import { Controller, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventPattern } from '@nestjs/microservices';
import { OrderDto } from './dto/order.dto';
import { PAYMENT_EVENT } from '../shared/constants';

@Controller('payment')
export class PaymentController {
  private logger = new Logger('PaymentController');

  constructor(private readonly service: PaymentService) {}

  @EventPattern(PAYMENT_EVENT.paymentInitiated)
  async initiatePayment(order: OrderDto): Promise<string> {
    try {
      const payment = await this.service.initiatePayment(order);
      return payment.transactionId;
    } catch (error) {
      this.logger.error(error, error.stack);
      return;
    }
  }

  @EventPattern(PAYMENT_EVENT.paymentCanceled)
  async cancelPayment(trxId: string) {
    try {
      await this.service.cancelPayment(trxId);
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }
}
