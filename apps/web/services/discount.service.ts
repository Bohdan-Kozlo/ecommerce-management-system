import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";

export interface IValidatePromocodeDto {
  code: string;
  orderAmount: number;
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

export interface IPromocodeValidationResponse {
  valid: boolean;
  promocode?: IPromocode;
  discountAmount?: number;
  message?: string;
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
