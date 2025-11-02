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

function redirectToLogin() {
  window.location.href = "/auth/login";
  throw new Error("Redirecting to login...");
}

export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers as HeadersInit);
  headers.set("Content-Type", "application/json");

  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: skipAuth ? "omit" : "include",
  };

  const fullUrl = url.startsWith("http") ? url : `${SERVER_URL}${url}`;
  let response = await fetch(fullUrl, finalOptions);

  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshSucceeded = await refreshPromise;

    if (!refreshSucceeded) {
      redirectToLogin();
    }

    response = await fetch(fullUrl, finalOptions);
  }

  if (response.status === 401 && !skipAuth) {
    redirectToLogin();
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
