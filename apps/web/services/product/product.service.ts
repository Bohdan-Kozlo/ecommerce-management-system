import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type {
  IProduct,
  IProductsResponse,
  IProductFilters,
} from "@/shared/types/product.interface";

export async function getProducts(
  filters?: IProductFilters
): Promise<IProductsResponse> {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.minPrice !== undefined)
    params.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined)
    params.append("maxPrice", filters.maxPrice.toString());
  if (filters?.sort) params.append("sort", filters.sort);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = `${API_URL.product()}${queryString ? `?${queryString}` : ""}`;

  return apiFetch<IProductsResponse>(url, { method: "GET" });
}

export async function getProductById(id: string): Promise<IProduct> {
  return apiFetch<IProduct>(API_URL.product(id), { method: "GET" });
}
