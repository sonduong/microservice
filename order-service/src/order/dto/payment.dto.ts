import { PaymentStatus } from '../../shared/payment-status.enum';

export class PaymentDto {
  id: number;
  orderId: number;
  userId: number;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
}
