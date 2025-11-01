import { API_URL } from "@/config/api.config";
import type {
  IAuthLoginForm,
  IAuthRegisterForm,
  IAuthResponse,
} from "@/shared/types/auth.interface";

interface AuthRequestOptions<TBody extends object> {
  endpoint: string;
  body: TBody;
}

async function request<TResponse, TBody extends object>({
  endpoint,
  body,
}: AuthRequestOptions<TBody>): Promise<TResponse> {
  const response = await fetch(API_URL.auth(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorPayload = await parseError(response);
    throw new Error(errorPayload);
  }

  return response.json() as Promise<TResponse>;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (!payload.message) {
      return "Something went wrong. Please try again.";
    }

    if (Array.isArray(payload.message)) {
      return payload.message.join(" ");
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }

    return "Something went wrong. Please try again.";
  } catch {
    return response.statusText || "Unexpected error. Please try again.";
  }
}

export async function login(payload: IAuthLoginForm): Promise<IAuthResponse> {
  return request<IAuthResponse, IAuthLoginForm>({
    endpoint: "login",
    body: payload,
  });
}

export async function register(
  payload: IAuthRegisterForm
): Promise<IAuthResponse> {
  return request<IAuthResponse, IAuthRegisterForm>({
    endpoint: "register",
    body: payload,
  });
}

export function getGoogleAuthUrl(redirectPath = "/"): string {
  return API_URL.googleAuth(redirectPath);
}
