import { Injectable, Logger } from '@nestjs/common';
import type { PaymentObserver } from './payment-observer';
import type { PaymentEvent } from './payment-event.type';

@Injectable()
export class PaymentSubject {
  private observers = new Set<PaymentObserver>();
  private logger = new Logger(PaymentSubject.name);

  register(observer: PaymentObserver): void {
    this.observers.add(observer);
  }

  unregister(observer: PaymentObserver): void {
    this.observers.delete(observer);
  }

  async notify(event: PaymentEvent): Promise<void> {
    const observers = Array.from(this.observers);

    if (observers.length === 0) {
      this.logger.debug(`No observers registered for event ${event.type}`);
      return;
    }

    await Promise.allSettled(
      observers.map(async (observer) => {
        await observer.onPaymentEvent(event);
      }),
    );
  }
}
