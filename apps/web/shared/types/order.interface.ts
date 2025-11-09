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

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface IDelivery {
  id: string;
  orderId: string;
  address: string;
  email: string;
  phone?: string;
  method: DeliveryMethod;
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
