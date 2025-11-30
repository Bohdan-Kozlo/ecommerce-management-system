import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DiscountModule } from '../discount/discount.module';
import { OrderChainFactory } from './handlers/order-chain.factory';
import { CartValidationHandler } from './handlers/cart-validation.handler';
import { StockValidationHandler } from './handlers/stock-validation.handler';
import { DiscountHandler } from './handlers/discount.handler';
import { PromotionHandler } from './handlers/promotion.handler';
import { ReservationHandler } from './handlers/reservation.handler';
import { DeliveryCalculationHandler } from './handlers/delivery-calculation.handler';

@Module({
  imports: [DiscountModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderChainFactory,
    CartValidationHandler,
    StockValidationHandler,
    DiscountHandler,
    PromotionHandler,
    ReservationHandler,
    DeliveryCalculationHandler,
  ],
})
export class OrderModule {}
