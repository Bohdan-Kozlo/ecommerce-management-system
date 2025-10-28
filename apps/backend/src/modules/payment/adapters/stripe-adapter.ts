import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DeliveryMethod } from '@prisma/client';
import { IPaymentAdapter, OrderInfo } from './payment-adapter';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import type { PaymentDeliveryDetails } from '../events/payment-event.type';

@Injectable()
export class StripeAdapter implements IPaymentAdapter {
  private stripe: Stripe;

  private logger = new Logger(StripeAdapter.name);

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  async createPayment(createPaymentDto: CreatePaymentDto, orderInfo: OrderInfo) {
    const lineItems = orderInfo.orderItems.map((item, index) => {
      const product = orderInfo.products[index];

      return {
        price_data: {
          currency: createPaymentDto.currency.toLowerCase(),
          product_data: {
            name: product?.name || 'Product',
            description: product?.description || undefined,
            images: product?.productImages?.map((img) => img.url) || undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    this.logger.debug(`Creating Stripe checkout session for order ${orderInfo.orderId}`);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url:
        createPaymentDto.returnUrl ||
        `${this.configService.getOrThrow('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        createPaymentDto.cancelUrl || `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
      metadata: {
        orderId: orderInfo.orderId,
        deliveryAddress: createPaymentDto.delivery.address,
        deliveryMethod: createPaymentDto.delivery.method,
        deliveryPhone: createPaymentDto.delivery.phone ?? '',
        deliveryEmail: createPaymentDto.delivery.email,
      },
      customer_email: createPaymentDto.delivery.email,
    });

    this.logger.debug(`Stripe checkout session created with ID: ${session.id}`);

    if (!session.url) {
      this.logger.error(`Failed to create Stripe checkout session for order ${orderInfo.orderId}`);
      throw new InternalServerErrorException('Failed to create Stripe checkout session');
    }

    this.logger.debug(`Stripe checkout session created with ID: ${session.id}`);

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  handleCallback(payload: unknown, headers: Record<string, string | string[] | undefined>) {
    const signatureHeader = headers['stripe-signature'] as string | undefined;
    const webhookSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event | undefined;

    try {
      if (signatureHeader) {
        let rawBody: Buffer | undefined;

        if (Buffer.isBuffer(payload)) {
          rawBody = payload;
        } else if (typeof payload === 'string') {
          rawBody = Buffer.from(payload);
        } else {
          this.logger.warn(
            'Stripe webhook payload is not a string or Buffer; cannot verify signature',
          );
          return { success: false, provider: 'stripe' };
        }

        event = this.stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
      }
    } catch (err) {
      this.logger.error('Stripe webhook signature verification failed', err as Error);
      return { success: false, provider: 'stripe' };
    }

    if (!event) {
      return { success: false, provider: 'stripe' };
    }

    this.logger.debug(`Stripe webhook event received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      if (!this.isCheckoutSession(event.data.object)) {
        this.logger.warn('Stripe checkout.session.completed received with unexpected payload');
        return { success: false, provider: 'stripe', event: event.type };
      }

      const session = event.data.object;
      const orderId = session.metadata?.orderId ?? undefined;

      if (!orderId) {
        this.logger.warn('Stripe checkout.session.completed received without orderId in metadata');
        return { success: false, provider: 'stripe', event: event.type };
      }

      const delivery = this.extractDeliveryDetails(session);

      return { success: true, orderId, provider: 'stripe', event: event.type, delivery };
    }

    return { success: false, provider: 'stripe', event: event.type };
  }

  private extractDeliveryDetails(
    session: Stripe.Checkout.Session,
  ): PaymentDeliveryDetails | undefined {
    const metadata = session.metadata ?? {};

    const address = metadata.deliveryAddress ?? undefined;
    const methodRaw = metadata.deliveryMethod ?? undefined;
    const phoneRaw = metadata.deliveryPhone ?? undefined;
    const email =
      session.customer_details?.email ??
      session.customer_email ??
      metadata.deliveryEmail ??
      undefined;

    if (!address || !methodRaw || !email) {
      return undefined;
    }

    const method = (Object.values(DeliveryMethod) as string[]).includes(methodRaw)
      ? (methodRaw as DeliveryMethod)
      : undefined;

    if (!method) {
      this.logger.warn(`Received unsupported delivery method from Stripe metadata: ${methodRaw}`);
      return undefined;
    }

    const phone = phoneRaw && phoneRaw.trim().length > 0 ? phoneRaw : undefined;

    return {
      address,
      email,
      method,
      phone,
    };
  }

  private isCheckoutSession(object: Stripe.Event.Data.Object): object is Stripe.Checkout.Session {
    return (
      typeof object === 'object' &&
      object !== null &&
      'object' in object &&
      object.object === 'checkout.session'
    );
  }
}
