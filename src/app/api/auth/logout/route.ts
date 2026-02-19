import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // OPTIMASI: Hapus semua cookie sesi yang diset saat login
    // agar tidak ada data residu yang tertinggal di browser.
    cookieStore.delete("auth_token");
    cookieStore.delete("user_role");

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
