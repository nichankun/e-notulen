import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { nip, password } = (await request.json()) as Record<string, string>;

    // OPTIMASI: Tambahkan limit(1) agar query lebih ringan dan cepat diproses DB
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.nip, nip))
      .limit(1);

    // --- FITUR AUTO-SEED ---
    if (!user && nip === "199XXXXX" && password === "admin123") {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);

      const [newUser] = await db
        .insert(users)
        .values({
          nip: "199XXXXX",
          password: hashedAdminPassword,
          name: "Administrator IT",
          role: "admin",
        })
        .returning();

      user = newUser;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "NIP tidak terdaftar" },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "NIP atau Kata Sandi salah" },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // OPTIMASI: Tambahkan sameSite: "lax" untuk mencegah CSRF attack
    cookieStore.set("auth_token", user.id.toString(), {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 60 * 60 * 24
      secure: isProd,
      sameSite: "lax",
    });

    cookieStore.set("user_role", user.role || "pegawai", {
      httpOnly: true,
      path: "/",
      maxAge: 86400,
      secure: isProd,
      sameSite: "lax",
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
