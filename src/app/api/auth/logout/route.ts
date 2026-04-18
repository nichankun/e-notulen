import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// ==========================================
// POST: MENGAKHIRI SESI (LOGOUT)
// ==========================================
export async function POST() {
  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // Menghapus cookie dengan parameter keamanan yang persis sama
    // dengan saat diciptakan. Ini menjamin browser (terutama Safari/iOS)
    // akan benar-benar menghancurkan sesi secara permanen.
    cookieStore.delete({
      name: "auth_token",
      path: "/",
      secure: isProd,
      sameSite: "lax",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Sesi berhasil diakhiri secara aman.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("API POST Logout Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses permintaan keluar.",
      },
      { status: 500 },
    );
  }
}
