import { db } from "@/db";
import { users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs"; // Install: npm install bcryptjs && npm install -D @types/bcryptjs

const userSchema = z.object({
  name: z.string().min(3),
  nip: z.string().min(5),
  password: z.string().min(6),
  role: z.enum(["admin", "pegawai"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validasi Zod
    const parse = userSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parse.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { name, nip, password, role } = parse.data;

    // 2. Hashing Password (Keamanan Standar Industri)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Simpan ke DB
    await db.insert(users).values({
      name,
      nip,
      password: hashedPassword, // Simpan versi yang sudah di-hash
      role,
    });

    return NextResponse.json({
      success: true,
      message: "Pegawai baru berhasil didaftarkan",
    });
  } catch (error: unknown) {
    // Penanganan Error Database tanpa 'any'
    if (typeof error === "object" && error !== null && "code" in error) {
      const dbError = error as { code: string };

      if (dbError.code === "23505") {
        return NextResponse.json(
          { success: false, message: "NIP tersebut sudah terdaftar di sistem" },
          { status: 400 },
        );
      }
    }

    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
