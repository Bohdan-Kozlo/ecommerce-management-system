import { apiFetch } from "@/api/api-fetch-client";
import { API_URL } from "@/config/api.config";
import type { ICategory } from "@/shared/types/category.interface";

export async function getCategories(): Promise<ICategory[] | null> {
  return apiFetch<ICategory[]>(API_URL.category(), { method: "GET" });
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
  return apiFetch<ICategory>(API_URL.category(id), { method: "GET" });
}
