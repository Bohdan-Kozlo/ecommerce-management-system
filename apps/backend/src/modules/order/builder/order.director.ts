import { Prisma } from '@prisma/client';
import { IOrderBuilder, OrderBuildInput } from './order-builder.interface';

export class OrderDirector {
  constructor(private builder: IOrderBuilder) {}

  buildOrder(input: OrderBuildInput): Prisma.OrderCreateInput {
    return this.builder
      .reset()
      .setUser(input.userId)
      .setTotalAmount(input.totalAmount)
      .setOrderItems(input.items)
      .setPromocode(input.promocode)
      .build();
  }
}
