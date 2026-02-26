import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Pastikan secret key SAMA PERSIS dengan yang ada di endpoint Login
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026",
);

// Tambahkan 'async' karena jwtVerify menggunakan Promise
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika TIDAK ADA token
  if (!token) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next(); // Bebas akses halaman publik (seperti '/')
  }

  // 2. Jika ADA token, kita VERIFIKASI keasliannya
  try {
    // jwtVerify akan gagal (masuk ke catch) jika token palsu, diubah, atau expired
    const { payload } = await jwtVerify(token, SECRET_KEY);

    // Ambil role langsung dari dalam JWT yang sudah terenkripsi dengan aman
    const role = payload.role as string;

    // Jika user sudah login dan mencoba akses halaman login -> Redirect ke Dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // PROTEKSI ROLE: Hanya admin yang boleh masuk ke menu Users
    if (pathname.startsWith("/dashboard/users") && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // OPTIONAL TERBAIK: Teruskan informasi user ke headers
    // Ini sangat berguna agar Server Components di dalam layout/page tidak perlu decode JWT lagi
    const response = NextResponse.next();
    response.headers.set("x-user-role", role);
    response.headers.set("x-user-nip", payload.nip as string);

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  // Matcher sudah sangat bagus
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
