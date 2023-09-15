import { Response } from 'express';
import { Observable, from } from 'rxjs';
import { Controller, Get, Logger, Post, Body, Param, HttpStatus, Res } from '@nestjs/common';
import { ApiImplicitParam, ApiUseTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderDto } from './dto/order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '../shared/order-status.enum';
import { PaymentDto } from './dto/payment.dto';
import { PAYMENT_EVENT } from '../shared/constants';

@Controller('orders')
@ApiUseTags('orders')
export class OrderController {
  private readonly logger = new Logger('OrderController');

  constructor(
    private readonly service: OrderService,
  ) {
  }

  @Get()
  getAll(): Observable<OrderDto[]> {
    return from(this.service.findAll().then((orders) => {
      return orders.map(({id, amount, userId, status}) => new OrderDto(id, amount, userId, status));
    }));
  }

  @Post()
  async create(@Res() res: Response, @Body() createOrderDto: CreateOrderDto) {
    if (!createOrderDto || !createOrderDto.amount || createOrderDto.amount < 0) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    try {
      const order = await this.service.create(createOrderDto);
      await this.service.initiatePayment(order.id);
      return res.status(HttpStatus.CREATED).send(order);
    } catch (error) {
      this.logger.log('error in create', JSON.stringify(error));
      return res.status(HttpStatus.BAD_REQUEST).send(JSON.stringify(error));
    }
  }

  @Get(':id')
  @ApiImplicitParam({
    name: 'id',
    required: true,
    description: 'Order ID',
  })
  async get(@Res() res: Response, @Param('id') id: number) {
    if (!id) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    const order = await this.service.findById(id);
    if (!order) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    return res.send(order);
  }

  @Get(':id/status')
  @ApiImplicitParam({
    name: 'id',
    required: true,
    description: 'Order ID',
  })
  async getStatus(@Res() res: Response, @Param('id') id: number) {
    if (!id) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }

    try {
      const order = await this.service.findById(id);
      if (!order) {
        return res.status(HttpStatus.NOT_FOUND).send();
      }

      return res.send(order.status);
    } catch (error) {
      this.logger.error(error, error.stack);
      return res.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @Post(':id/cancel')
  @ApiImplicitParam({
    name: 'id',
    required: true,
    description: 'Order ID',
  })
  async cancel(@Res() res: Response, @Param('id') id: number) {
    try {
      const order = await this.service.cancel(id);
      await this.service.cancelPayment(order);
      return res.send(order);
    } catch (error) {
      this.logger.error(error, error.stack);
      return res.status(HttpStatus.BAD_REQUEST).send(error);
    }
  }

  @EventPattern(PAYMENT_EVENT.paymentProcessed)
  async paymentProcessed(data: PaymentDto) {
    try {
      const order = await this.service.updateOrderStatus(data);

      if (order && order.status === OrderStatus.Confirmed) {
        setTimeout(async () => {
          await this.service.deliver(order.id);
        }, (Math.floor(Math.random() * 10) + 1) * 2000);
      }
    } catch (error) {
      this.logger.error(error, error.stack);
    }
  }
}
