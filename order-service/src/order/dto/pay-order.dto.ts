import { ApiModelProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../shared/order-status.enum';

export class PayOrderDto {
  @ApiModelProperty()
  id: number;
  @ApiModelProperty()
  amount: number;
  @ApiModelProperty()
  status: OrderStatus;
  @ApiModelProperty()
  userId: number;
}
