import type { PaymentEvent } from './payment-event.type';

export interface PaymentObserver {
  onPaymentEvent(event: PaymentEvent): Promise<void> | void;
}
