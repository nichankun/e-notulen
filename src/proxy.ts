import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  // Opsional: Proteksi ekstra jika aplikasi sudah masuk server production
  if (!secret && process.env.NODE_ENV === "production") {
    console.warn(
      "Peringatan: JWT_SECRET tidak ditemukan di environment variables!",
    );
  }
  return new TextEncoder().encode(
    secret || "rahasia-negara-bapenda-sultra-super-aman-2026",
  );
};

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

    // Cegah user yang sudah login kembali ke halaman login
    if (pathname === "/" || pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard/users") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-role", role);

    // Karena sistem presensi e-notulen sudah tidak lagi menggunakan NIP,
    // pastikan payload.nip ini memang masih dibutuhkan oleh komponen lain (misal untuk profil).
    if (payload.nip) {
      response.headers.set("x-user-nip", payload.nip as string);
    }

    return response;
  } catch (err) {
    console.error("[Proxy] JWT verify failed:", err);

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
