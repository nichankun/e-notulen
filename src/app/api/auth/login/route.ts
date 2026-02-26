import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Gunakan environment variable untuk secret key di production
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026",
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nip, password } = body as Record<string, string>;

    // 1. Validasi Input Dasar
    if (!nip || !password) {
      return NextResponse.json(
        { success: false, message: "NIP dan Kata Sandi wajib diisi" },
        { status: 400 },
      );
    }

    // 2. Ambil user dari database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.nip, nip))
      .limit(1);

    // 3. Validasi User & Password (Pesan error disamakan demi keamanan)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "NIP atau Kata Sandi salah" },
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

    // 4. Generate JWT
    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      nip: user.nip,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Token aktif 24 jam
      .sign(SECRET_KEY);

    // 5. Set Cookie
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 24 jam
      secure: isProd,
      sameSite: "lax",
    });

    // 6. Return Response (Kirim data user ke client untuk disimpan di state/Zustand)
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        nip: user.nip,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
