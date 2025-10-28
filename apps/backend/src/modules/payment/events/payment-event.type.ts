import { DeliveryMethod } from '@prisma/client';

export enum PaymentEventType {
  PaymentSucceeded = 'payment.succeeded',
}

export interface PaymentDeliveryDetails {
  address: string;
  email: string;
  method: DeliveryMethod;
  phone?: string;
}

export interface PaymentEventPayload {
  orderId: string;
  userId: string;
  delivery: PaymentDeliveryDetails;
}

export interface PaymentEvent {
  type: PaymentEventType;
  payload: PaymentEventPayload;
}
