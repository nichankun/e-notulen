import { db } from "@/db";
import { users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

// --- TYPE GUARD UNTUK POSTGRES ERROR (Lebih aman dari 'in' operator biasa) ---
function isPgUniqueError(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

// --- FUNGSI BANTUAN PROTEKSI ADMIN-ONLY ---
async function requireAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  // Pastikan token valid, memiliki ID, dan role-nya WAJIB 'admin'
  if (!payload || !payload.id || payload.role !== "admin") return null;

  return { userId: Number(payload.id) };
}

// 1. SCHEMA VALIDASI POST (Create)
const userSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2, "Instansi wajib diisi"),
});

// 2. SCHEMA VALIDASI PATCH (Update)
const patchUserSchema = z.object({
  id: z.number(),
  name: z.string().min(3),
  nip: z.string().min(5),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2),
  // OPTIMASI ZOD: Langsung validasi minimal 6 karakter jika diisi, atau abaikan jika kosong
  password: z
    .union([
      z.string().min(6, "Password baru minimal 6 karakter"),
      z.literal(""),
      z.undefined(),
    ])
    .optional(),
});

interface UserUpdatePayload {
  name?: string;
  nip?: string;
  role?: "admin" | "pegawai";
  agency?: string;
  password?: string;
}

// ==========================================
// POST: MEMBUAT USER BARU (Hanya Admin)
// ==========================================
export async function POST(req: Request) {
  try {
    const adminUser = await requireAdminAuth();
    if (!adminUser)
      return NextResponse.json(
        {
          success: false,
          message: "Akses Ditolak: Hanya Administrator yang diizinkan",
        },
        { status: 403 },
      );

    const body: unknown = await req.json();
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

    const { name, nip, password, role, agency } = parse.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      nip,
      password: hashedPassword,
      role,
      agency,
    });

    return NextResponse.json(
      { success: true, message: "Pegawai baru berhasil didaftarkan" },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (isPgUniqueError(error)) {
      return NextResponse.json(
        { success: false, message: "NIP tersebut sudah terdaftar di sistem" },
        { status: 400 },
      );
    }
    console.error("User Create Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// ==========================================
// PATCH: UPDATE USER (Hanya Admin)
// ==========================================
export async function PATCH(req: Request) {
  try {
    const adminUser = await requireAdminAuth();
    if (!adminUser)
      return NextResponse.json(
        {
          success: false,
          message: "Akses Ditolak: Hanya Administrator yang diizinkan",
        },
        { status: 403 },
      );

    const body: unknown = await req.json();
    const parse = patchUserSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: parse.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { id, name, nip, role, agency, password } = parse.data;

    const updateData: UserUpdatePayload = { name, nip, role, agency };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
    });
  } catch (error: unknown) {
    if (isPgUniqueError(error)) {
      return NextResponse.json(
        { success: false, message: "NIP sudah digunakan oleh pegawai lain" },
        { status: 400 },
      );
    }
    console.error("User Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data user" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE: HAPUS USER (Hanya Admin)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const adminUser = await requireAdminAuth();
    if (!adminUser)
      return NextResponse.json(
        {
          success: false,
          message: "Akses Ditolak: Hanya Administrator yang diizinkan",
        },
        { status: 403 },
      );

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam || isNaN(Number(idParam))) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );
    }

    const targetId = Number(idParam);

    // Mencegah admin menghapus dirinya sendiri secara tidak sengaja
    if (targetId === adminUser.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak dapat menghapus akun Anda sendiri",
        },
        { status: 400 },
      );
    }

    const deleted = await db
      .delete(users)
      .where(eq(users.id, targetId))
      .returning({ id: users.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus permanen",
    });
  } catch (error: unknown) {
    console.error("User Delete Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus user" },
      { status: 500 },
    );
  }
}
