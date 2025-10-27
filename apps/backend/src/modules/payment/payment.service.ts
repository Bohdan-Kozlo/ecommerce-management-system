import { Injectable } from '@nestjs/common';
import { IPaymentAdapter } from './adapters/payment-adapter';

@Injectable()
export class PaymentService {
  constructor(private paymentAdapter: IPaymentAdapter) {}
}
