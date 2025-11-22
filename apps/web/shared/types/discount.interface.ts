import { IProduct } from "./product.interface";

export interface IDiscount {
  id: string;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId: string;
  product?: IProduct;
}

export interface ICreateDiscountDto {
  value: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  productId: string;
}

export interface IUpdateDiscountDto {
  value?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  productId?: string;
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

export interface ICreatePromocodeDto {
  value: number;
  minOrderAmount: number;
  maxUsage: number;
  isActive?: boolean;
}

export interface IUpdatePromocodeDto {
  value?: number;
  minOrderAmount?: number;
  maxUsage?: number;
  isActive?: boolean;
}

export interface IValidatePromocodeDto {
  code: string;
  orderAmount: number;
}

export interface IPromocodeValidationResponse {
  valid: boolean;
  promocode?: IPromocode;
  discountAmount?: number;
  message?: string;
}
