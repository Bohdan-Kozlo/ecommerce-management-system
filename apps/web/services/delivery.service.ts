import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type { IDeliveryOption } from "@/shared/types/order.interface";

export async function getDeliveryOptions(): Promise<IDeliveryOption[]> {
  return apiFetch<IDeliveryOption[]>(API_URL.delivery.options(), {
    method: "GET",
  });
}
