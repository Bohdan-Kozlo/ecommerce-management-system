import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface IPaymentAdapter {
  createPayment(createPaymentDto: CreatePaymentDto);
  handleCallback();
}

export const IPaymentAdapter = Symbol('IPaymentAdapter');
