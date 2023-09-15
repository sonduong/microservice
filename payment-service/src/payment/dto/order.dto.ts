import { OrderStatus } from '../../shared/order-status.enum';

export class OrderDto {
  id: number;
  userId: number;
  amount: number;
  status: OrderStatus;
}
