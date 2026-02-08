import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const role = request.cookies.get("user_role")?.value; // Ambil role dari cookie
  const { pathname } = request.nextUrl;

  // 1. Jika user belum login dan mencoba akses dashboard -> Redirect ke Login
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Jika user sudah login dan mencoba akses halaman login -> Redirect ke Dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. PROTEKSI ROLE: Staff dilarang masuk ke menu Users
  if (pathname.startsWith("/dashboard/users")) {
    if (role !== "admin") {
      // Jika bukan admin, lempar balik ke dashboard utama
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Gunakan matcher yang lebih aman agar tidak memproses file statis (mencegah loop)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
