import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Promocode } from '@prisma/client';
import { OrderProcessingContext, OrderItemCalculation } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

export class PromotionHandler extends OrderProcessingHandler {
  protected async process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.pricedItems) {
      throw new InternalServerErrorException('Priced items are missing before applying promocode');
    }

    let totalAfterDiscounts = context.pricedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    let promoDiscount = 0;
    let finalItems = context.pricedItems;

    if (context.promocodeCode) {
      const promocode = await context.prisma.promocode.findUnique({
        where: { code: context.promocodeCode },
      });

      if (!promocode) {
        throw new NotFoundException('Promocode not found');
      }

      this.validatePromocode(promocode, totalAfterDiscounts);
      promoDiscount = Math.min(promocode.value, totalAfterDiscounts);
      context.appliedPromocode = promocode;
    }

    if (promoDiscount > 0) {
      finalItems = this.applyPromoDiscount(context.pricedItems, promoDiscount);
      totalAfterDiscounts = finalItems.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    context.pricedItems = finalItems;
    context.promoDiscount = promoDiscount;
    context.total = totalAfterDiscounts;

    return context;
  }

  private validatePromocode(promocode: Promocode, orderTotal: number) {
    if (!promocode.isActive) {
      throw new BadRequestException('Promocode is inactive');
    }

    if (promocode.usedCount >= promocode.maxUsage) {
      throw new BadRequestException('Promocode usage limit reached');
    }

    if (orderTotal < promocode.minOrderAmount) {
      throw new BadRequestException('Order total does not meet the minimum amount for promocode');
    }
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
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.quantity > 0 ? newLineTotal / item.quantity : 0,
        lineTotal: newLineTotal,
      };
    });
  }
}
