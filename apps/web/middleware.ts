import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export enum EnumTokens {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
}

const JWT_SECRET = process.env.JWT_SECRET;
const LOGIN_URL = "/auth/login";

let secretKey: Uint8Array | undefined;
if (JWT_SECRET) {
  secretKey = new TextEncoder().encode(JWT_SECRET);
} else {
  console.error("JWT_SECRET does not exist in environment variables.");
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(EnumTokens.REFRESH_TOKEN)?.value;
  const { pathname } = request.nextUrl;

  const loginUrl = new URL(LOGIN_URL, request.url);
  loginUrl.searchParams.set("from", pathname);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  if (!secretKey) {
    console.warn("Middleware: JWT_SECRET does not exist, skipping validation.");
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (pathname.startsWith("/admin")) {
      const role = payload.role as string;

      if (role !== "ADMIN") {
        console.warn("Middleware: User is not an admin, redirecting to home");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "ERR_JWT_EXPIRED") {
      console.log(
        "Middleware: Access token has expired, allowing request to continue for refresh..."
      );
      return NextResponse.next();
    }

    console.error("Middleware: Invalid token (signature error?).", err.message);
    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(EnumTokens.REFRESH_TOKEN);
    response.cookies.delete(EnumTokens.ACCESS_TOKEN);

    return response;
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
