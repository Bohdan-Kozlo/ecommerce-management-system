import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type {
  IProduct,
  IProductsResponse,
  IProductFilters,
} from "@/shared/types/product.interface";

export async function getProducts(
  filters?: IProductFilters
): Promise<IProductsResponse | null> {
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

export async function getProductById(id: string): Promise<IProduct | null> {
  return apiFetch<IProduct>(API_URL.product(id), { method: "GET" });
}

export interface ICreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  images?: File[];
}

export interface IUpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  images?: File[];
  existingImageUrls?: string[];
}

export async function createProduct(
  data: ICreateProductData
): Promise<IProduct | null> {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  formData.append("price", data.price.toString());
  formData.append("stock", data.stock.toString());
  if (data.categoryId) formData.append("categoryId", data.categoryId);

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  return apiFetch<IProduct>(API_URL.product(), {
    method: "POST",
    body: formData,
    headers: {},
  });
}

export async function updateProduct(
  id: string,
  data: IUpdateProductData
): Promise<IProduct | null> {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.price !== undefined) formData.append("price", data.price.toString());
  if (data.stock !== undefined) formData.append("stock", data.stock.toString());
  if (data.categoryId !== undefined)
    formData.append("categoryId", data.categoryId);

  if (data.existingImageUrls && data.existingImageUrls.length > 0) {
    data.existingImageUrls.forEach((url) => {
      formData.append("images", url);
    });
  }

  if (data.images && data.images.length > 0) {
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  return apiFetch<IProduct>(API_URL.product(id), {
    method: "PATCH",
    body: formData,
    headers: {},
  });
}

export async function deleteProduct(
  id: string
): Promise<{ productId: string } | null> {
  return apiFetch<{ productId: string }>(API_URL.product(id), {
    method: "DELETE",
  });
}
