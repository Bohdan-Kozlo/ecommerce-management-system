import { apiFetch } from "@/api/api-fetch-client";

import { API_URL } from "@/config/api.config";

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  ordersCount: number;
  imageUrl: string | null;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalItemsSold: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface RevenueData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDate: {
    date: string;
    revenue: number;
    ordersCount: number;
  }[];
}

export async function getTopProducts(
  from?: string,
  to?: string,
  limit?: number
): Promise<TopProduct[]> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (limit) params.append("limit", limit.toString());

  const response = await apiFetch<TopProduct[]>(
    API_URL.report(`top-products?${params.toString()}`),
    {
      method: "GET",
    }
  );

  return response;
}

export async function getSalesByCategory(
  from?: string,
  to?: string
): Promise<SalesByCategory[]> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const response = await apiFetch<SalesByCategory[]>(
    API_URL.report(`sales-by-category?${params.toString()}`),
    {
      method: "GET",
    }
  );

  return response;
}

export async function getRevenue(
  from?: string,
  to?: string
): Promise<RevenueData> {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const response = await apiFetch<RevenueData>(
    API_URL.report(`revenue?${params.toString()}`),
    {
      method: "GET",
    }
  );

  return response;
}
