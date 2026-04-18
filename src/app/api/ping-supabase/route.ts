import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Hanya ambil 'error' agar TypeScript/ESLint tidak protes
    const { error } = await supabase.storage.getBucket("notulen");

    if (error) {
      console.error("Gagal menyapa Supabase:", error.message);
      return NextResponse.json(
        {
          success: false,
          message: "Supabase menolak akses, tapi ping tetap terhitung aktif.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ketukan ke Storage Supabase berhasil, sistem tetap terjaga!",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Kesalahan Jaringan Ping:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 },
    );
  }
}
