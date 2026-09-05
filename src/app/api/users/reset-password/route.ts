import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// ==========================================
// 1. ZOD SCHEMA (Validasi Ganti Password)
// ==========================================
const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter").max(128),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi").max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  });

// ==========================================
// 2. HELPER: OTENTIKASI SESI
// ==========================================
async function authenticateRequest() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      error: "Sesi Anda telah habis. Silakan login kembali.",
      status: 401,
    };
  }

  return { user: { id: user.id } };
}

// ==========================================
// PATCH: UPDATE PASSWORD
// ==========================================
export async function PATCH(req: Request) {
  try {
    // 1. Validasi Sesi (Menggunakan Helper)
    const auth = await authenticateRequest();
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const limit = rateLimit(
      `reset-password:${auth.user!.id}:${getClientIp(req)}`,
      5,
      15 * 60 * 1000,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const { id: userId } = auth.user!;

    // 2. Validasi Payload Zod
    const body: unknown = await req.json();
    const parse = resetPasswordSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parse.error.flatten().fieldErrors, // Lebih ramah untuk UI Frontend
        },
        { status: 400 },
      );
    }

    const { oldPassword, newPassword } = parse.data;

    // 3. Cek Database (Ambil hash password lama)
    const [currentUser] = await db
      .select({ password: users.password }) // Kita hanya butuh passwordnya saja
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Akun tidak ditemukan di sistem." },
        { status: 404 },
      );
    }

    // 4. Verifikasi Kecocokan Password Lama
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      currentUser.password,
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Password lama yang Anda masukkan salah." },
        { status: 401 }, // 401 Unauthorized lebih tepat untuk password salah
      );
    }

    // 5. Update ke Password Baru
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
