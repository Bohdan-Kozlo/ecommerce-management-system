export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export enum DeliveryMethod {
  COUIRIER = "COUIRIER",
  LOCKER = "LOCKER",
  DEPARTMENT = "DEPARTMENT",
}

import type { IProduct } from "./product.interface";

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: IProduct;
}

export interface IDelivery {
  id: string;
  orderId: string;
  address: string;
  email: string;
  phone?: string;
  method: DeliveryMethod;
}

export interface IPromocode {
  id: string;
  code: string;
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
}

export interface IOrder {
  id: string;
  status: OrderStatus;
  userId: string;
  totalAmount: number;
  promocodeId?: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems: IOrderItem[];
  delivery?: IDelivery;
  promocode?: IPromocode;
}

export interface ICreateOrderDto {
  promocodeId?: string;
  delivery: {
    address: string;
    email: string;
    phone?: string;
    method: DeliveryMethod;
  };
}
