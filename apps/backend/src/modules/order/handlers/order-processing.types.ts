import { Prisma, Promocode, DeliveryMethod } from '@prisma/client';

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
  deliveryMethod?: DeliveryMethod;
  now: Date;
  cart?: CartWithItems;
  total?: number;
  promoDiscount?: number;
  deliveryPrice?: number;
  appliedPromocode?: Promocode;
  pricedItems?: OrderItemCalculation[];
}
