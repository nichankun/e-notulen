import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod"; // INOVASI: Tambahkan Zod untuk konsistensi keamanan

// 1. ZOD SCHEMA: Menjamin input selalu berupa string yang valid
const loginSchema = z.object({
  nip: z.string().min(1, "NIP wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

// Gunakan environment variable untuk secret key di production
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-negara-bapenda-sultra-super-aman-2026",
);

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parse = loginSchema.safeParse(body);

    // 2. Validasi Input Dasar dengan Zod
    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "NIP dan Kata Sandi wajib diisi dengan benar",
        },
        { status: 400 },
      );
    }

    const { nip, password } = parse.data;

    // 3. Ambil user dari database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.nip, nip))
      .limit(1);

    // 4. Validasi User & Password (Pesan error disamakan demi keamanan / mencegah enumerasi akun)
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

    // 5. Generate JWT (id di sini sekarang otomatis berupa UUID string yang aman)
    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      nip: user.nip,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Token aktif 24 jam
      .sign(SECRET_KEY);

    // 6. Set Cookie
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 86400, // 24 jam
      secure: isProd,
      sameSite: "lax",
    });

    // 7. Return Response
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id, // Optional: Bisa dikirim jika client butuh UUID-nya
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
