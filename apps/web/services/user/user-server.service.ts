import { API_URL } from "@/config/api.config";
import { cookies } from "next/headers";
import type { IUser } from "@/shared/types/user.interface";

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export async function getCurrentUserServer(): Promise<IUser> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(API_URL.auth("../users/me"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `accessToken=${accessToken.value}`,
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json() as Promise<IUser>;
}
