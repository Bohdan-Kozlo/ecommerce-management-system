import { Injectable } from '@nestjs/common';
import { IPaymentAdapter } from './payment-adapter';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';

@Injectable()
export class StripeAdapter implements IPaymentAdapter {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  createPayment(createPaymentDto: CreatePaymentDto) {}
  handleCallback() {}
}
