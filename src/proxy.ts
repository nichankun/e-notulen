import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PERUBAHAN: Ganti nama fungsi dari 'middleware' menjadi 'proxy'
export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  // 1. Jika user belum login dan mencoba akses dashboard -> Redirect ke Login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Jika user sudah login dan mencoba akses halaman login -> Redirect ke Dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi Matcher tetap sama
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
