import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { OrderDto } from './dto/order.dto';
import { OrderStatus } from '../shared/order-status.enum';
import { PaymentStatus } from '../shared/payment-status.enum';
import { ORDER_MGMT_MQ } from '../shared/constants';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPaymentRepository = {
    insert: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        PaymentService,
        {
          provide: ORDER_MGMT_MQ,
          useValue: mockClientProxy,
        },
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = await module.resolve<PaymentService>(PaymentService);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('initiatePayment', () => {
    it('successful payment', async () => {
      const order: OrderDto = new OrderDto();
      order.status = OrderStatus.Created;
      order.id = 1;
      order.userId = 1;
      order.amount = 100;
      const payment = await service.initiatePayment(order);
      expect(payment.status).toEqual(PaymentStatus.Confirmed);
    });

    it('failed every five payments', async () => {
      const order: OrderDto = new OrderDto();
      order.status = OrderStatus.Created;
      order.id = 5;
      order.userId = 1;
      order.amount = 100;
      const payment = await service.initiatePayment(order);
      expect(payment.status).toEqual(PaymentStatus.Declined);
    });

    it('decline if insufficient amount', async () => {
      const order: OrderDto = new OrderDto();
      order.status = OrderStatus.Created;
      order.id = 1;
      order.userId = 1;
      order.amount = 1001;
      const payment = await service.initiatePayment(order);
      expect(payment.status).toEqual(PaymentStatus.Declined);
    });

    it('decline if invalid user', async () => {
      const order: OrderDto = new OrderDto();
      order.status = OrderStatus.Created;
      order.id = 1;
      order.userId = 3;
      order.amount = 100;
      const payment = await service.initiatePayment(order);
      expect(payment.status).toEqual(PaymentStatus.Declined);
    });

    it('throw error if wrong status', async () => {
      const order: OrderDto = new OrderDto();
      order.status = OrderStatus.Confirmed;
      const payment = service.initiatePayment(order);
      await expect(payment).rejects.toThrow(new Error('Order should be created.'));
    });
  });

  describe('cancelPayment', () => {
    beforeEach(() => {
      mockClientProxy.emit.mockClear();
      mockPaymentRepository.save.mockClear();
    });

    it('success', async () => {
      jest.spyOn(mockPaymentRepository, 'findOne').mockResolvedValue({ status: PaymentStatus.Confirmed });
      jest.spyOn(mockPaymentRepository, 'save').mockResolvedValue({ status: PaymentStatus.Declined });
      await service.cancelPayment('valid_transaction_id');
      expect(mockClientProxy.emit.mock.calls).toHaveLength(1);
      expect(mockPaymentRepository.save.mock.calls).toHaveLength(1);
    });

    it('success without update', async () => {
      jest.spyOn(mockPaymentRepository, 'findOne').mockResolvedValue({ status: PaymentStatus.Declined });
      jest.spyOn(mockPaymentRepository, 'save').mockResolvedValue({ status: PaymentStatus.Declined });
      await service.cancelPayment('valid_transaction_id');
      expect(mockClientProxy.emit.mock.calls).toHaveLength(1);
      expect(mockPaymentRepository.save.mock.calls).toHaveLength(0);
    });
  });
});
