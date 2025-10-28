import { OrderItem, Product } from '@prisma/client';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import type { PaymentDeliveryDetails } from '../events/payment-event.type';

export interface IPaymentAdapter {
  createPayment(
    createPaymentDto: CreatePaymentDto,
    orderInfo: OrderInfo,
  ): Promise<PaymentCreationResult>;
  handleCallback(
    payload: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<PaymentCallbackResult> | PaymentCallbackResult;
}

export interface OrderInfo {
  orderId: string;
  totalAmount: number;
  orderItems: OrderItem[];
  products: Array<Product & { productImages: { url: string }[] }>;
}

export interface PaymentCreationResult {
  sessionId: string;
  url: string;
}

export interface PaymentCallbackResult {
  success: boolean;
  orderId?: string;
  provider?: string;
  event?: string;
  delivery?: PaymentDeliveryDetails;
}

export const IPaymentAdapter = Symbol('IPaymentAdapter');
