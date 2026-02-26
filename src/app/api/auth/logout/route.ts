import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Cukup hapus token utama.
    // Jika auth_token hilang, otomatis semua akses (termasuk role) akan terputus.
    cookieStore.delete("auth_token");

    // Jika sebelumnya kamu mengatur cookie dengan path spesifik,
    // disarankan untuk memberikan opsi path saat menghapus agar browser tidak bingung
    // cookieStore.delete({ name: "auth_token", path: "/" });

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
