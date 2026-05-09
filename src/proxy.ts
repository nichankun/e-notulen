import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getSecretKey = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026",
  );

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  console.log("[Proxy] pathname:", pathname);
  console.log("[Proxy] token exists:", !!token);
  console.log("[Proxy] JWT_SECRET exists:", !!process.env.JWT_SECRET);

  // 1. Jika TIDAK ADA token
  if (!token) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika ADA token, verifikasi
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const role = payload.role as string;

    console.log("[Proxy] JWT valid, role:", role);

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/users") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-role", role);
    response.headers.set("x-user-nip", payload.nip as string);
    return response;
  } catch (err) {
    console.error("[Proxy] JWT verify failed:", err);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
