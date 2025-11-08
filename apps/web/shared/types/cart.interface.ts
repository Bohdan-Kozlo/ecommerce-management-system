import type { IProduct } from "./product.interface";

export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  product: IProduct;
  quantity: number;
}

export interface ICart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  cartItems: ICartItem[];
}

export interface IAddCartItemDto {
  productId: string;
  quantity: number;
}

export interface IUpdateCartItemQuantityDto {
  productId: string;
  quantity: number;
}
