import { apiFetch } from "@/api/api-fetch-client";
import type { IUser } from "@/shared/types/user.interface";

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export async function getCurrentUser(): Promise<IUser> {
  return apiFetch<IUser>("/users/me", {
    method: "GET",
  });
}

export async function updateCurrentUser(
  payload: UpdateUserPayload
): Promise<IUser> {
  return apiFetch<IUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
