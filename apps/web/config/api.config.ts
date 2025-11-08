const DEFAULT_SERVER_URL = "http://localhost:4000/api";

const ENV_SERVER_URL = process.env.SERVER_URL;

const normalizedServerUrl = (ENV_SERVER_URL || DEFAULT_SERVER_URL).replace(
  /\/$/,
  ""
);

export const SERVER_URL = normalizedServerUrl;

export const API_URL = {
  auth: (url = "") => `${SERVER_URL}/auth/${url}`,
  googleAuth: (redirect?: string) =>
    `${SERVER_URL}/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`,
  user: (url = "") => `${SERVER_URL}/user/${url}`,
  product: (url = "") => `${SERVER_URL}/products/${url}`,
  category: (url = "") => `${SERVER_URL}/categories/${url}`,
  cart: (url = "") => `${SERVER_URL}/cart/${url}`,
};
