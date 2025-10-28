import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeAdapter } from './adapters/stripe-adapter';
import { IPaymentAdapter } from './adapters/payment-adapter';
import { PaymentSubject } from './events/payment-subject';

@Module({
  providers: [
    PaymentService,
    PaymentSubject,
    {
      provide: IPaymentAdapter,
      useClass: StripeAdapter,
    },
  ],
  controllers: [PaymentController],
  exports: [PaymentSubject],
})
export class PaymentModule {}
