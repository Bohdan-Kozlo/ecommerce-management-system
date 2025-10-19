import { Prisma, Promocode } from '@prisma/client';
import { OrderItemCalculation } from '../handlers/order-processing.types';
import { IOrderBuilder } from './order-builder.interface';

export class OrderBuilder implements IOrderBuilder {
  private userId?: string;
  private totalAmount = 0;
  private promocodeId?: string;
  private items: OrderItemCalculation[] = [];

  reset(): this {
    this.userId = undefined;
    this.totalAmount = 0;
    this.promocodeId = undefined;
    this.items = [];
    return this;
  }

  setUser(userId: string): this {
    this.userId = userId;
    return this;
  }

  setTotalAmount(amount: number): this {
    this.totalAmount = amount;
    return this;
  }

  setPromocode(promocode?: Promocode): this {
    this.promocodeId = promocode?.id;
    return this;
  }

  setOrderItems(items: OrderItemCalculation[]): this {
    this.items = items.map((item) => ({ ...item }));
    return this;
  }

  build(): Prisma.OrderCreateInput {
    if (!this.userId) {
      throw new Error('User id is required to build an order');
    }

    if (this.items.length === 0) {
      throw new Error('At least one order item is required');
    }

    const orderData: Prisma.OrderCreateInput = {
      totalAmount: this.totalAmount,
      user: {
        connect: { id: this.userId },
      },
      orderItems: {
        create: this.items.map((item) => ({
          quantity: item.quantity,
          price: item.unitPrice,
          product: {
            connect: { id: item.productId },
          },
        })),
      },
    };

    if (this.promocodeId) {
      orderData.promocode = {
        connect: { id: this.promocodeId },
      };
    }

    this.reset();
    return orderData;
  }
}
