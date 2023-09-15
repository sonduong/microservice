import { OrderStatus } from '../../shared/order-status.enum';

export class OrderDto {
  constructor(id: number, amount: number = 0, userId: number, status: OrderStatus, transactionId?: string) {
    this.id = id;
    this.amount = amount;
    this.userId = userId;
    this.status = status;
    this.transactionId = transactionId;
  }

  id: number;
  amount: number;
  userId: number;
  status: OrderStatus;
  transactionId?: string;
}
