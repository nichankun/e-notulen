import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nip, password } = body;

    // 1. Cek User di Database
    let userResult = await db.select().from(users).where(eq(users.nip, nip));

    // --- FITUR AUTO-SEED (Hanya untuk Demo Pertama Kali) ---
    // Jika tabel user kosong dan yang login adalah "199XXXXX" (sesuai HTML), kita buatkan akunnya otomatis.
    if (
      userResult.length === 0 &&
      nip === "199XXXXX" &&
      password === "admin123"
    ) {
      const [newUser] = await db
        .insert(users)
        .values({
          nip: "199XXXXX",
          password: "admin123", // Di production wajib di-hash!
          name: "Administrator IT",
          role: "admin",
        })
        .returning();
      userResult = [newUser];
    }
    // -------------------------------------------------------

    const user = userResult[0];

    // 2. Validasi Password
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: "NIP atau Kata Sandi salah" },
        { status: 401 },
      );
    }

    // 3. Set Cookie (Session Sederhana)
    // Di aplikasi Pro sungguhan, gunakan library seperti 'jose' atau 'next-auth' untuk JWT
    const cookieStore = await cookies();
    cookieStore.set("auth_token", user.id.toString(), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 Hari
    });

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
