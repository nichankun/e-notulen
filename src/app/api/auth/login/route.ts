import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs"; // 1. Import bcrypt

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const { nip, password } = body;

    // 2. Cari User berdasarkan NIP
    let userResult = await db.select().from(users).where(eq(users.nip, nip));

    // --- FITUR AUTO-SEED (Diperbarui dengan Hashing) ---
    if (
      userResult.length === 0 &&
      nip === "199XXXXX" &&
      password === "admin123"
    ) {
      // Kita hash dulu password admin demo sebelum masuk ke DB
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);

      const [newUser] = await db
        .insert(users)
        .values({
          nip: "199XXXXX",
          password: hashedAdminPassword, // Gunakan hash
          name: "Administrator IT",
          role: "admin",
        })
        .returning();
      userResult = [newUser];
    }

    const user = userResult[0];

    // 3. Validasi User & Password
    if (!user) {
      return NextResponse.json(
        { success: false, message: "NIP tidak terdaftar" },
        { status: 401 },
      );
    }

    // 4. Bandingkan password input (plain) dengan password di DB (hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "NIP atau Kata Sandi salah" },
        { status: 401 },
      );
    }

    // 5. Set Cookie (Session)
    const cookieStore = await cookies();

    cookieStore.set("auth_token", user.id.toString(), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });

    cookieStore.set("user_role", user.role || "pegawai", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
