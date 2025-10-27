import { Injectable, Inject } from '@nestjs/common';
import { IPaymentAdapter } from './adapters/payment-adapter';

@Injectable()
export class PaymentService {
  constructor(@Inject(IPaymentAdapter) private paymentAdapter: IPaymentAdapter) {}
}
