import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Promocode } from '@prisma/client';
import { OrderProcessingContext, OrderItemCalculation } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';
import { DiscountService } from '../../discount/discount.service';

@Injectable()
export class PromotionHandler extends OrderProcessingHandler {
  constructor(private discountService: DiscountService) {
    super();
  }

  protected async process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.pricedItems) {
      throw new InternalServerErrorException('Priced items are missing before applying promocode');
    }

    if (!context.promocodeCode) {
      return context;
    }

    const currentTotal = context.total || 0;

    const validationResult = await this.discountService.validatePromocode({
      code: context.promocodeCode,
      orderAmount: currentTotal,
    });

    if (!validationResult.valid) {
      throw new InternalServerErrorException(validationResult.message);
    }

    if (!validationResult.promocode || !validationResult.discountAmount) {
      return context;
    }

    context.appliedPromocode = validationResult.promocode as Promocode;
    const promoDiscount = validationResult.discountAmount;

    if (promoDiscount > 0) {
      context.pricedItems = this.applyPromoDiscount(context.pricedItems, promoDiscount);
      context.total = context.pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    return context;
  }

  private applyPromoDiscount(
    items: OrderItemCalculation[],
    promoDiscount: number,
  ): OrderItemCalculation[] {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    if (subtotal === 0 || promoDiscount <= 0) {
      return items;
    }

    let remainingDiscount = promoDiscount;

    return items.map((item, index) => {
      if (remainingDiscount <= 0) {
        return item;
      }

      const proportion = item.lineTotal / subtotal;
      let itemDiscount = promoDiscount * proportion;

      if (index === items.length - 1) {
        itemDiscount = remainingDiscount;
      } else {
        itemDiscount = Math.min(itemDiscount, remainingDiscount);
      }

      const newLineTotal = Math.max(item.lineTotal - itemDiscount, 0);
      remainingDiscount -= itemDiscount;

      return {
        ...item,
        unitPrice: item.quantity > 0 ? newLineTotal / item.quantity : 0,
        lineTotal: newLineTotal,
      };
    });
  }
}
