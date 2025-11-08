import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type {
  ICart,
  IAddCartItemDto,
  IUpdateCartItemQuantityDto,
} from "@/shared/types/cart.interface";

export async function getUserCart(): Promise<ICart> {
  return apiFetch<ICart>(API_URL.cart(), { method: "GET" });
}

export async function addItemToCart(dto: IAddCartItemDto): Promise<ICart> {
  return apiFetch<ICart>(API_URL.cart("items"), {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateCartItemQuantity(
  dto: IUpdateCartItemQuantityDto
): Promise<ICart> {
  return apiFetch<ICart>(API_URL.cart("items"), {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function removeItemFromCart(productId: string): Promise<ICart> {
  return apiFetch<ICart>(API_URL.cart(`items/${productId}`), {
    method: "DELETE",
  });
}

export async function cleanCart(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(API_URL.cart(), {
    method: "DELETE",
  });
}
