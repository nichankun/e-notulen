import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // INOVASI: Menghapus cookie dengan parameter keamanan yang persis sama
    // dengan saat diciptakan di fungsi Login. Ini menjamin browser (terutama Safari)
    // akan benar-benar menghancurkan sesi secara permanen tanpa "bingung".
    cookieStore.delete({
      name: "auth_token",
      path: "/",
      secure: isProd,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      message: "Sesi berhasil diakhiri secara aman",
    });
  } catch (error: unknown) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memproses permintaan keluar" },
      { status: 500 },
    );
  }
}
