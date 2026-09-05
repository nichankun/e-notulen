import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/jwt";

const getSecretKey = () => {
  return getJwtSecretKey();
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika TIDAK ADA token
  if (!token) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 2. Jika ADA token, verifikasi
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const role = payload.role as string;

    // Cegah user yang sudah login kembali ke halaman login
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/users") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify failed:", err);

    let response;

    // SOLUSI ERR_TOO_MANY_REDIRECTS:
    // Jika token gagal diverifikasi dan user berada di halaman root (/) atau (/login),
    // biarkan request lewat agar halaman login bisa dirender, jangan di-redirect lagi.
    if (pathname === "/" || pathname === "/login") {
      response = NextResponse.next();
    } else {
      // Jika mereka di halaman terlindungi seperti /dashboard, baru arahkan ke /
      response = NextResponse.redirect(new URL("/", request.url));
    }

    // Hapus cookie token yang rusak/kedaluwarsa
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
