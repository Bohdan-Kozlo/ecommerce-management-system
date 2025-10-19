import { Prisma, Promocode } from '@prisma/client';
import { OrderItemCalculation } from '../handlers/order-processing.types';

export interface IOrderBuilder {
  reset(): this;
  setUser(userId: string): this;
  setTotalAmount(amount: number): this;
  setPromocode(promocode?: Promocode): this;
  setOrderItems(items: OrderItemCalculation[]): this;
  build(): Prisma.OrderCreateInput;
}

export interface OrderBuildInput {
  userId: string;
  totalAmount: number;
  items: OrderItemCalculation[];
  promocode?: Promocode;
}
