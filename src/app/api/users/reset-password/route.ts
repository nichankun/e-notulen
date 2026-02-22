import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 1. SCHEMA VALIDASI REQUEST BODY
const resetPasswordSchema = z.object({
  oldPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  // confirmPassword tidak perlu dicek di server lagi karena sudah dicek via Zod di Frontend,
  // tapi kita tambahkan opsional agar tidak error saat parsing JSON.
  confirmPassword: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    // 2. OTENTIKASI SESI: Pastikan user yang mengubah password adalah user yang sedang login
    const cookieStore = await cookies();
    const userIdString = cookieStore.get("auth_token")?.value;

    if (!userIdString) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi Anda telah habis. Silakan login kembali.",
        },
        { status: 401 },
      );
    }

    const userId = Number(userIdString);

    // 3. VALIDASI PAYLOAD
    const body: unknown = await req.json();
    const parse = resetPasswordSchema.safeParse(body);

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

    const { oldPassword, newPassword } = parse.data;

    // 4. CEK DATABASE: Ambil password lama (hashed) dari database
    const [currentUser] = await db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan di sistem." },
        { status: 404 },
      );
    }

    // 5. VERIFIKASI PASSWORD LAMA
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      currentUser.password,
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Password lama yang Anda masukkan salah." },
        { status: 401 }, // 401 Unauthorized karena kredensial tidak cocok
      );
    }

    // 6. UPDATE PASSWORD BARU
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses permintaan.",
      },
      { status: 500 },
    );
  }
}
