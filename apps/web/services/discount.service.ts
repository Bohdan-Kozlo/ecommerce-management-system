import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import {
  IDiscount,
  IPromocode,
  ICreateDiscountDto,
  IUpdateDiscountDto,
  ICreatePromocodeDto,
  IUpdatePromocodeDto,
  IValidatePromocodeDto,
  IPromocodeValidationResponse,
} from "@/shared/types/discount.interface";

// Discount methods
export async function getAllDiscounts(): Promise<IDiscount[] | null> {
  return apiFetch<IDiscount[]>(API_URL.discount(), {
    method: "GET",
  });
}

export async function getDiscountById(id: string): Promise<IDiscount | null> {
  return apiFetch<IDiscount>(API_URL.discount(id), {
    method: "GET",
  });
}

export async function createDiscount(
  data: ICreateDiscountDto
): Promise<IDiscount | null> {
  return apiFetch<IDiscount>(API_URL.discount(), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDiscount(
  id: string,
  data: IUpdateDiscountDto
): Promise<IDiscount | null> {
  return apiFetch<IDiscount>(API_URL.discount(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteDiscount(id: string): Promise<IDiscount | null> {
  return apiFetch<IDiscount>(API_URL.discount(id), {
    method: "DELETE",
  });
}

// Promocode methods
export async function getAllPromocodes(): Promise<IPromocode[] | null> {
  return apiFetch<IPromocode[]>(API_URL.discount("promocodes"), {
    method: "GET",
  });
}

export async function getPromocodeById(id: string): Promise<IPromocode | null> {
  return apiFetch<IPromocode>(API_URL.discount(`promocodes/${id}`), {
    method: "GET",
  });
}

export async function createPromocode(
  data: ICreatePromocodeDto
): Promise<IPromocode | null> {
  return apiFetch<IPromocode>(API_URL.discount("promocodes"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePromocode(
  id: string,
  data: IUpdatePromocodeDto
): Promise<IPromocode | null> {
  return apiFetch<IPromocode>(API_URL.discount(`promocodes/${id}`), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePromocode(id: string): Promise<IPromocode | null> {
  return apiFetch<IPromocode>(API_URL.discount(`promocodes/${id}`), {
    method: "DELETE",
  });
}

export async function validatePromocode(
  data: IValidatePromocodeDto
): Promise<IPromocodeValidationResponse | null> {
  return apiFetch<IPromocodeValidationResponse>(
    API_URL.discount("promocodes/validate"),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}
export type { IPromocodeValidationResponse };
