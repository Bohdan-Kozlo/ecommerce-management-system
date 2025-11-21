import { API_URL, SERVER_URL } from "@/config/api.config";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const requestUrl = buildUrl(url);
  const finalOptions = prepareOptions(options);

  let response = await fetch(requestUrl, finalOptions);

  const shouldHandle401 =
    response.status === 401 && !options.skipAuth && !isPublicPage();

  if (shouldHandle401) {
    const refreshed = await refreshTokens();

    if (!refreshed) return null;

    response = await fetch(requestUrl, finalOptions);

    if (response.status === 401) {
      return null;
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json() as Promise<T>;
}

function refreshTokens(): Promise<boolean> {
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = (async () => {
      try {
        const res = await fetch(API_URL.auth("refresh"), {
          method: "POST",
          credentials: "include",
        });

        return res.ok;
      } catch {
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise!;
}

const PUBLIC_PAGES = ["/auth/login", "/auth/register"];

function isPublicPage(): boolean {
  if (typeof window === "undefined") return false;

  const path = window.location.pathname;

  return PUBLIC_PAGES.some((page) =>
    page === "/" ? path === "/" : path.startsWith(page)
  );
}

function buildUrl(url: string): string {
  return url.startsWith("http") ? url : `${SERVER_URL}${url}`;
}

function prepareOptions(options: FetchOptions): RequestInit {
  const { skipAuth = false, ...rest } = options;

  const headers = new Headers(rest.headers as HeadersInit);
  if (!(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return {
    ...rest,
    headers,
    credentials: skipAuth ? "omit" : "include",
  };
}
