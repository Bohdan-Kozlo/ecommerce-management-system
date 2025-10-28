import { Injectable, Logger } from '@nestjs/common';
import type { PaymentObserver } from './payment-observer';
import type { PaymentEvent } from './payment-event.type';

@Injectable()
export class PaymentSubject {
  private readonly observers = new Set<PaymentObserver>();
  private readonly logger = new Logger(PaymentSubject.name);

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

    const results = await Promise.allSettled(
      observers.map(async (observer) => {
        await observer.onPaymentEvent(event);
      }),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const observer = observers[index]!;
        const error: unknown = result.reason;
        const message =
          error instanceof Error ? error.message : `Unknown error: ${JSON.stringify(error)}`;

        this.logger.error(
          `Observer ${observer.constructor?.name ?? 'UnknownObserver'} failed for event ${event.type}: ${message}`,
        );
      }
    });
  }
}
