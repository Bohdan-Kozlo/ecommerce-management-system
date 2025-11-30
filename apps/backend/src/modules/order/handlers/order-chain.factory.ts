import { Injectable } from '@nestjs/common';
import { CartValidationHandler } from './cart-validation.handler';
import { StockValidationHandler } from './stock-validation.handler';
import { DiscountHandler } from './discount.handler';
import { PromotionHandler } from './promotion.handler';
import { ReservationHandler } from './reservation.handler';
import { OrderProcessingHandler } from './order-processing.handler';
import { DeliveryCalculationHandler } from './delivery-calculation.handler';

@Injectable()
export class OrderChainFactory {
  constructor(
    private cartValidation: CartValidationHandler,
    private stockValidation: StockValidationHandler,
    private discount: DiscountHandler,
    private promotion: PromotionHandler,
    private reservation: ReservationHandler,
    private deliveryCalculation: DeliveryCalculationHandler,
  ) {}

  create(): OrderProcessingHandler {
    this.cartValidation
      .setNext(this.stockValidation)
      .setNext(this.discount)
      .setNext(this.promotion)
      .setNext(this.deliveryCalculation)
      .setNext(this.reservation);

    return this.cartValidation;
  }
}
