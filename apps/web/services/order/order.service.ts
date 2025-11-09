import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type { IOrder, ICreateOrderDto } from "@/shared/types/order.interface";

export async function createOrder(data: ICreateOrderDto): Promise<IOrder> {
  return apiFetch(API_URL.order(), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserOrders(): Promise<IOrder[]> {
  return apiFetch(API_URL.order(), {
    method: "GET",
  });
}

export async function getUserOrderById(orderId: string): Promise<IOrder> {
  return apiFetch(API_URL.order(orderId), {
    method: "GET",
  });
}
