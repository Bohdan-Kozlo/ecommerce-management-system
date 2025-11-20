"use client";

import { API_URL, SERVER_URL } from "@/config/api.config";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  try {
    const response = await fetch(API_URL.auth("refresh"), {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers as HeadersInit);

  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: skipAuth ? "omit" : "include",
  };

  const fullUrl = url.startsWith("http") ? url : `${SERVER_URL}${url}`;
  let response = await fetch(fullUrl, finalOptions);

  const publicPages = ["/auth/login", "/auth/register", "/", "/products"];
  const isPublicPage =
    typeof window !== "undefined" &&
    publicPages.some((page) => {
      if (page === "/") {
        return window.location.pathname === "/";
      }
      return window.location.pathname.includes(page);
    });

  if (response.status === 401 && !skipAuth && !isPublicPage) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshSucceeded = await refreshPromise;

    if (!refreshSucceeded) {
      return null as T;
    }

    response = await fetch(fullUrl, finalOptions);
  }

  if (response.status === 401 && !skipAuth && !isPublicPage) {
    return null as T;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
