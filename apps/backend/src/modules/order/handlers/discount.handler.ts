import { InternalServerErrorException } from '@nestjs/common';
import { OrderProcessingContext, OrderItemCalculation } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

export class DiscountHandler extends OrderProcessingHandler {
  protected process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.cart) {
      throw new InternalServerErrorException('Cart context is missing during discount calculation');
    }

    const pricedItems = this.calculateDiscountedItems(context);
    const discountedTotal = pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    context.pricedItems = pricedItems;
    context.promoDiscount = 0;
    context.total = discountedTotal;

    return Promise.resolve(context);
  }

  private calculateDiscountedItems(context: OrderProcessingContext): OrderItemCalculation[] {
    const now = context.now;

    return context.cart!.cartItems.map((item) => {
      const discountValue = item.product.discount.reduce((max, discount) => {
        const isActive = discount.isActive && discount.startDate <= now && discount.endDate >= now;

        if (!isActive) {
          return max;
        }

        return Math.max(max, discount.value);
      }, 0);

      const discountedUnitPrice = Math.max(item.product.price - discountValue, 0);
      const lineTotal = discountedUnitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: discountedUnitPrice,
        lineTotal,
      };
    });
  }
}
