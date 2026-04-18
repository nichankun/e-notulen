import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

// ==========================================
// 1. ZOD SCHEMA (Validasi Input)
// ==========================================
const loginSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

// ==========================================
// 2. JWT CONFIGURATION
// ==========================================
// Gunakan environment variable untuk secret key di production
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026",
);

// ==========================================
// POST: PROSES LOGIN & SET COOKIE
// ==========================================
export async function POST(request: Request) {
  try {
    // 1. Validasi Input Payload
    const body: unknown = await request.json();
    const parse = loginSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal. Periksa kembali input Anda.",
          errors: parse.error.flatten().fieldErrors, // Standarisasi format UI
        },
        { status: 400 },
      );
    }

    const { nip, password } = parse.data;

    // 2. Cari User di Database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.nip, nip))
      .limit(1);

    // 3. Verifikasi Keamanan (Pesan disamakan untuk cegah enumerasi akun)
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
      .setExpirationTime("24h") // Token aktif selama 1 hari
      .sign(SECRET_KEY);

    // 5. Set HTTP-Only Cookie
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 24 jam dalam detik
      secure: isProd,
      sameSite: "lax",
    });

    // 6. Kirim Respons Berhasil
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        nip: user.nip,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("API POST Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}
