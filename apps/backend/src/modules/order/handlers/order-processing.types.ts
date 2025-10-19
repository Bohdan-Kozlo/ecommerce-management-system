import { Prisma, Promocode } from '@prisma/client';

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    cartItems: {
      include: {
        product: {
          include: {
            discount: true;
          };
        };
      };
    };
  };
}>;

export interface OrderItemCalculation {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderProcessingContext {
  prisma: Prisma.TransactionClient;
  userId: string;
  promocodeCode?: string;
  now: Date;
  cart?: CartWithItems;
  subtotal?: number;
  total?: number;
  promoDiscount?: number;
  appliedPromocode?: Promocode;
  pricedItems?: OrderItemCalculation[];
}
