import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyAuthToken } from "@/lib/auth"; // Import utility auth kita

// 1. SCHEMA VALIDASI (DENGAN PENGECEKAN PASSWORD SAMA)
const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().optional(),
  })
  // OPTIMASI: Cegah user menggunakan password yang sama persis
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  });

export async function PATCH(req: Request) {
  try {
    // 2. OTENTIKASI SESI MENGGUNAKAN UTILITY
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi Anda telah habis. Silakan login kembali.",
        },
        { status: 401 },
      );
    }

    // Gunakan fungsi verifyAuthToken agar kode lebih bersih
    const payload = await verifyAuthToken(token);

    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah kedaluwarsa." },
        { status: 401 },
      );
    }

    const userId = Number(payload.id);

    // OPTIMASI: Pastikan userId adalah angka valid (Mencegah error NaN di Database)
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "Identitas pengguna tidak valid." },
        { status: 401 },
      );
    }

    // 3. VALIDASI PAYLOAD REQ.JSON()
    // Catatan: Jika body kosong, req.json() akan melempar error dan masuk ke block catch (500), ini wajar.
    const body: unknown = await req.json();
    const parse = resetPasswordSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parse.error.flatten(), // Format error dari Zod sudah sangat bagus
        },
        { status: 400 },
      );
    }

    const { oldPassword, newPassword } = parse.data;

    // 4. CEK DATABASE (Ambil password lama)
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

    // 5. VERIFIKASI PASSWORD LAMA (Mencegah orang lain meretas ganti password)
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      currentUser.password,
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Password lama yang Anda masukkan salah." },
        { status: 401 },
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
