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

  onModuleInit(): void {
    this.paymentSubject.register(this);
  }

  onModuleDestroy(): void {
    this.paymentSubject.unregister(this);
  }

  async onPaymentEvent(event: PaymentEvent): Promise<void> {
    if (event.type !== PaymentEventType.PaymentSucceeded) {
      return;
    }

    const { orderId, userId, delivery } = event.payload;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || !order.user) {
      this.logger.warn(`Unable to create delivery, order or user missing for order ${orderId}`);
      return;
    }

    if (order.userId !== userId) {
      this.logger.warn(
        `Delivery event user mismatch for order ${orderId}. Expected ${order.userId}, received ${userId}`,
      );
      return;
    }

    const existingDelivery = await this.prisma.delivery.findUnique({ where: { orderId } });

    if (existingDelivery) {
      this.logger.debug(`Delivery already exists for order ${orderId}, skipping creation`);
      return;
    }

    const address = delivery.address?.trim().length
      ? delivery.address
      : (order.user.address ?? 'Address not provided');
    const email = delivery.email;
    const phone = delivery.phone;
    const method = delivery.method;

    await this.prisma.delivery.create({
      data: {
        orderId,
        address,
        email,
        phone,
        method,
      },
    });

    this.logger.log(`Delivery created for order ${orderId} after successful payment`);
  }
}
