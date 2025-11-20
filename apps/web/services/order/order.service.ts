import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type {
  IOrder,
  ICreateOrderDto,
  IGetAllOrdersParams,
  IGetAllOrdersResponse,
  IOrderAdmin,
  IUpdateDeliveryDto,
} from "@/shared/types/order.interface";

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

export async function getAllOrders(
  params?: IGetAllOrdersParams
): Promise<IGetAllOrdersResponse> {
  return apiFetch(API_URL.orderAdmin.all(params), {
    method: "GET",
  });
}

export async function getOrderByIdAdmin(orderId: string): Promise<IOrderAdmin> {
  return apiFetch(API_URL.orderAdmin.byId(orderId), {
    method: "GET",
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<IOrderAdmin> {
  return apiFetch(API_URL.orderAdmin.updateStatus(orderId), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateDelivery(
  orderId: string,
  data: IUpdateDeliveryDto
): Promise<IOrderAdmin> {
  return apiFetch(API_URL.orderAdmin.updateDelivery(orderId), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function cancelOrder(orderId: string): Promise<IOrderAdmin> {
  return apiFetch(API_URL.orderAdmin.cancel(orderId), {
    method: "PATCH",
  });
}
