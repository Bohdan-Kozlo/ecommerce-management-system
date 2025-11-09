import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import { DeliveryMethod } from "@/shared/types/order.interface";

export interface IDeliveryInfo {
  address: string;
  email: string;
  phone?: string;
  method: DeliveryMethod;
}

export interface ICreatePaymentDto {
  orderId: string;
  provider: string;
  currency: string;
  returnUrl?: string;
  cancelUrl?: string;
  delivery: IDeliveryInfo;
}

export interface IPaymentResponse {
  sessionId: string;
  url: string;
}

export async function createPayment(
  data: ICreatePaymentDto
): Promise<IPaymentResponse> {
  return apiFetch(API_URL.payment(), {
    method: "POST",
    body: JSON.stringify(data),
  });
}
