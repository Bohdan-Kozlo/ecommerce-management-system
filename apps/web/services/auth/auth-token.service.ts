import { cookies } from "next/headers";

export enum EnumTokens {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
}

export const getAccessToken = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(EnumTokens.ACCESS_TOKEN);
  if (!accessToken) {
    return null;
  }

  return accessToken.value;
};
