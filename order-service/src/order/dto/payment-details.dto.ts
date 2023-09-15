import { ApiModelProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../shared/payment-status.enum';

export class PaymentDetailsDto {
  constructor(orderId: string) {
    this.orderId = orderId;
    this.status = PaymentStatus.Declined;
    this.transactionId = (Math.round(Math.random() * 999999)).toString();
  }

  @ApiModelProperty()
  orderId: string;
  @ApiModelProperty()
  status: PaymentStatus;
  @ApiModelProperty()
  transactionId: string;
}
