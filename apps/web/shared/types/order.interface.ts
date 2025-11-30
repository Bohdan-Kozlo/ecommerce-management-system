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

export interface IDeliveryOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  method: DeliveryMethod;
  isActive: boolean;
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
  promocode?: string;
  delivery: {
    address: string;
    email: string;
    phone?: string;
    method: DeliveryMethod;
  };
}

// Admin interfaces
export interface IOrderItemAdmin {
  id: string;
  quantity: number;
  price: number;
  product?: {
    title: string;
    productImages?: Array<{ url: string }>;
  };
}

export interface IDeliveryAdmin {
  address: string;
  email: string;
  phone?: string;
  method: DeliveryMethod;
}

export interface IOrderAdmin {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  orderItems: IOrderItemAdmin[];
  delivery: IDeliveryAdmin;
  promocode?: {
    code: string;
    value: number;
  };
}

export interface IGetAllOrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface IGetAllOrdersResponse {
  orders: IOrderAdmin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IUpdateDeliveryDto {
  address?: string;
  email?: string;
  phone?: string;
  method?: string;
}
