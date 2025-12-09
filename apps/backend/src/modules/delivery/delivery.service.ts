import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaymentObserver } from '../payment/events/payment-observer';
import { PaymentSubject } from '../payment/events/payment-subject';
import { PaymentEvent, PaymentEventType } from '../payment/events/payment-event.type';

@Injectable()
export class DeliveryService implements PaymentObserver, OnModuleInit, OnModuleDestroy {
  constructor(
    private prisma: PrismaService,
    private paymentSubject: PaymentSubject,
  ) {}

  private readonly logger = new Logger(DeliveryService.name);

  async getDeliveryOptions() {
    return this.prisma.deliveryOption.findMany({
      where: { isActive: true },
    });
  }

  onModuleInit(): void {
    this.paymentSubject.register(this);
  }

  onModuleDestroy(): void {
    this.paymentSubject.unregister(this);
  }

  async onPaymentEvent(event: PaymentEvent) {
    if (event.type !== PaymentEventType.PaymentSucceeded) {
      return;
    }

    const { orderId, userId, delivery } = event.payload;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { user: true },
    });

    if (!order || !order.user) {
      this.logger.warn(`Unable to create delivery`);
      return;
    }

    await this.prisma.delivery.create({
      data: {
        orderId,
        address: delivery.address,
        email: delivery.email,
        phone: delivery.phone,
        method: delivery.method,
      },
    });
  }
}
