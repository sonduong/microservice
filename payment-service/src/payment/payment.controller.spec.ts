import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderDto } from './dto/order.dto';

describe('Payment Controller', () => {
  let controller: PaymentController;

  const mockPaymentService = {
    initiatePayment: jest.fn().mockReturnThis(),
    cancelPayment: jest.fn().mockReturnThis(),
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
      controllers: [PaymentController],
    }).compile();

    controller = await module.resolve<PaymentController>(PaymentController);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('initiatePayment', () => {
    it('success', async () => {
      jest.spyOn(mockPaymentService, 'initiatePayment').mockResolvedValue({ transactionId: 'transactionId' });
      const result = await controller.initiatePayment(new OrderDto());
      expect(result).toEqual('transactionId');
    });

    it('failed', async () => {
      jest.spyOn(mockPaymentService, 'initiatePayment').mockRejectedValue(new Error());
      const result = await controller.initiatePayment(new OrderDto());
      expect(result).toBeUndefined();
    });
  });

  describe('cancelPayment', () => {
    it('success', async () => {
      jest.spyOn(mockPaymentService, 'cancelPayment').mockResolvedValue({});
      const result = await controller.cancelPayment('transactionId');
      expect(result).toBeUndefined();
    });

    it('failed', async () => {
      jest.spyOn(mockPaymentService, 'cancelPayment').mockImplementation(() => {
        throw new Error();
      });
      const result = await controller.cancelPayment('invalidTransactionId');
      expect(result).toBeUndefined();
    });
  });
});
