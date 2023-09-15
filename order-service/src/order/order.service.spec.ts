import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_MGMT_MQ } from '../shared/constants';
import { PaymentDto } from './dto/payment.dto';
import { PaymentStatus } from '../shared/payment-status.enum';
import { OrderStatus } from '../shared/order-status.enum';
import {OrderEntity} from "./order.entity";

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = {
    find: jest.fn().mockResolvedValue([]),
    findByIds: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: ORDER_MGMT_MQ,
          useValue: mockClientProxy,
        },
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = await module.resolve<OrderService>(OrderService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('findAll', () => {
    it('success', async () => {
      const orders = await service.findAll();
      expect(orders).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('return a sole order', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      const order = await service.findById(1);
      expect(order.id).toEqual(1);
    });

    it('return undefined', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([]);
      const order = await service.findById(1);
      expect(order).toBeUndefined();
    });
  });

  describe('create', () => {
    it('return a sole order', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      jest.spyOn(mockOrderRepository, 'insert').mockResolvedValue({ identifiers: [ { id: 1 } ]});
      const order = await service.create({ amount: 0, userId: 1 } as CreateOrderDto);
      expect(order.id).toEqual(1);
    });
  });

  describe('updateOrderStatus', () => {
    it('success with confirmed payment', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      jest.spyOn(mockOrderRepository, 'save').mockResolvedValue({ id: 1, status: OrderStatus.Confirmed });
      const paymentDto = {
        id: 1,
        amount: 50,
        userId: 1,
        transactionId: '123-456-789',
        orderId: 1,
        status: PaymentStatus.Confirmed,
      } as PaymentDto;
      const order = await service.updateOrderStatus(paymentDto);
      expect(order.status).toEqual(OrderStatus.Confirmed);
    });

    it('success with declined payment', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      jest.spyOn(mockOrderRepository, 'save').mockResolvedValue({ id: 1, status: OrderStatus.Canceled });
      const paymentDto = {
        id: 1,
        amount: 50,
        userId: 1,
        transactionId: '123-456-789',
        orderId: 1,
        status: PaymentStatus.Declined,
      } as PaymentDto;
      const order = await service.updateOrderStatus(paymentDto);
      expect(order.status).toEqual(OrderStatus.Canceled);
    });

    it('failed if payment does not include order id', async () => {
      const paymentDto = {
        id: 1,
        amount: 50,
        userId: 1,
        transactionId: '123-456-789',
        status: PaymentStatus.Declined,
      } as PaymentDto;
      const order = service.updateOrderStatus(paymentDto);
      await expect(order).rejects.toThrow(new Error('Invalid payment.'));
    });

    it('failed if invalid order', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([]);
      const paymentDto = {
        id: 1,
        amount: 50,
        userId: 1,
        transactionId: '123-456-789',
        orderId: 1,
        status: PaymentStatus.Declined,
      } as PaymentDto;
      const order = service.updateOrderStatus(paymentDto);
      await expect(order).rejects.toThrow(new Error('Invalid order.'));
    });

    it('failed if invalid order', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      const paymentDto = {
        id: 1,
        amount: 50,
        userId: 1,
        transactionId: '123-456-789',
        orderId: 1,
      } as PaymentDto;
      const order = service.updateOrderStatus(paymentDto);
      await expect(order).rejects.toThrow(new Error('Invalid payment status.'));
    });
  });

  describe('initiatePayment', () => {
    it('success', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1 }]);
      jest.spyOn(mockClientProxy, 'emit');
      await service.initiatePayment(1);
      expect(mockClientProxy.emit.mock.calls).toHaveLength(1);
    });
  });

  describe('cancel', () => {
    it('success', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1, status: OrderStatus.Confirmed }]);
      jest.spyOn(mockOrderRepository, 'save').mockResolvedValue({ id: 1, status: OrderStatus.Canceled });
      const order = await service.cancel(1);
      expect(order.status).toEqual(OrderStatus.Canceled);
    });

    it('do nothing if order is cancelled already', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1, status: OrderStatus.Canceled }]);
      const order = await service.cancel(1);
      expect(order.status).toEqual(OrderStatus.Canceled);
    });

    it('failed if incorrect status', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1, status: OrderStatus.Delivered }]);
      const order = service.cancel(1);
      await expect(order).rejects.toThrow(new Error('Can not cancel delivered order.'));
    });
  });

  describe('cancelPayment', () => {
    beforeEach(() => {
      mockClientProxy.emit.mockClear();
    });

    it('success', async () => {
      jest.spyOn(mockClientProxy, 'emit');
      await service.cancelPayment({ status: OrderStatus.Confirmed } as OrderEntity);
      expect(mockClientProxy.emit.mock.calls).toHaveLength(1);
    });

    it('do nothing if order is cancelled already', async () => {
      const order = await service.cancelPayment({ status: OrderStatus.Canceled } as OrderEntity);
      expect(order).toBeUndefined();
    });

    it('failed if incorrect status', async () => {
      const order = service.cancelPayment({ status: OrderStatus.Delivered } as OrderEntity);
      await expect(order).rejects.toThrow(new Error('Order can not be canceled after delivery.'));
    });
  });

  describe('deliver', () => {
    beforeEach(() => {
      mockOrderRepository.save.mockClear();
    });

    it('success', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1, status: OrderStatus.Confirmed }]);
      jest.spyOn(mockOrderRepository, 'save');
      await service.deliver(1);
      expect(mockOrderRepository.save.mock.calls).toHaveLength(1);
    });

    it('failed if incorrect status', async () => {
      jest.spyOn(mockOrderRepository, 'findByIds').mockResolvedValue([{ id: 1, status: OrderStatus.Canceled }]);
      const order = service.deliver(1);
      await expect(order).rejects.toThrow(new Error('Order should be confirmed before delivery.'));
    });
  });
});
