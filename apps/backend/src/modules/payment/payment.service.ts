import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { IPaymentAdapter, PaymentCallbackResult } from './adapters/payment-adapter';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DeliveryMethod, OrderStatus } from '@prisma/client';
import type { OrderInfo } from './adapters/payment-adapter';
import { PaymentSubject } from './events/payment-subject';
import { PaymentDeliveryDetails, PaymentEventType } from './events/payment-event.type';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(IPaymentAdapter) private paymentAdapter: IPaymentAdapter,
    private prisma: PrismaService,
    private paymentSubject: PaymentSubject,
  ) {}

  private logger = new Logger(PaymentService.name);

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId, userId },
      include: {
        orderItems: {
          include: {
            product: {
              include: { productImages: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found with id ' + createPaymentDto.orderId);
    }

    const orderInfo: OrderInfo = {
      orderId: order.id,
      totalAmount: order.totalAmount,
      orderItems: order.orderItems,
      products: order.orderItems.map((item) => item.product),
    };

    const result = await this.paymentAdapter.createPayment(createPaymentDto, orderInfo);

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PENDING },
    });

    return result;
  }

  async handleCallback(
    payload: unknown,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ received: boolean }> {
    console.log('Handling payment callback with payload:', payload);
    const result: PaymentCallbackResult = await this.paymentAdapter.handleCallback(
      payload,
      headers,
    );
    console.log('Payment callback result:', result);
    if (!result.success || !result.orderId) {
      this.logger.warn(`Payment callback ignored or unsuccessful. Event: ${result.event}`);
      return { received: true };
    }

    const order = await this.prisma.order.findUnique({
      where: { id: result.orderId },
      include: { orderItems: true, user: true },
    });

    if (!order) {
      this.logger.error(`Order not found for successful payment callback: ${result.orderId}`);
      return { received: true };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID },
      });

      try {
        await tx.cart.update({
          where: { userId: order.userId },
          data: { cartItems: { deleteMany: {} } },
        });
      } catch {
        this.logger.debug(`No cart to clear for user ${order.userId}`);
      }

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    this.logger.log(`Payment processed and inventory updated for order ${order.id}`);

    const deliveryDetails: PaymentDeliveryDetails = {
      address: result.delivery?.address ?? order.user?.address ?? 'Address not provided',
      email: result.delivery?.email ?? order.user?.email ?? 'Email not provided',
      method: result.delivery?.method ?? DeliveryMethod.COUIRIER,
      phone: result.delivery?.phone ?? order.user?.phone ?? 'Phone not provided',
    };

    await this.paymentSubject.notify({
      type: PaymentEventType.PaymentSucceeded,
      payload: {
        orderId: order.id,
        userId: order.userId,
        delivery: deliveryDetails,
      },
    });

    return { received: true };
  }
}
