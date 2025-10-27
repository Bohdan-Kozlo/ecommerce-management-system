import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeAdapter } from './adapters/stripe-adapter';
import { IPaymentAdapter } from './adapters/payment-adapter';

@Module({
  providers: [
    PaymentService,
    {
      provide: IPaymentAdapter,
      useClass: StripeAdapter,
    },
  ],
  controllers: [PaymentController],
})
export class PaymentModule {}
