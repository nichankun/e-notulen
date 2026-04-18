import { db } from "@/db";
import { users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

// ==========================================
// 1. HELPERS & TYPE GUARDS
// ==========================================

// Mencegah aplikasi crash jika terjadi duplikasi NIP di Database
function isPgUniqueError(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

// Memusatkan logika Auth dan penanganan Error Respons
async function authenticateAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token)
    return { error: "Sesi tidak valid atau telah habis", status: 401 };

  const payload = await verifyAuthToken(token);

  if (!payload || !payload.id || payload.role !== "admin") {
    return {
      error: "Akses Ditolak: Hanya Administrator yang diizinkan",
      status: 403,
    };
  }

  return { user: { id: String(payload.id) } };
}

// ==========================================
// 2. ZOD SCHEMAS
// ==========================================
const userSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2, "Instansi wajib diisi"),
});

const patchUserSchema = z.object({
  id: z.string().min(1, "ID tidak valid"),
  name: z.string().min(3, "Nama minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter"),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2, "Instansi wajib diisi"),
  password: z
    .union([
      z.string().min(6, "Password baru minimal 6 karakter"),
      z.literal(""),
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
// POST: MEMBUAT USER BARU (Admin Only)
// ==========================================
export async function POST(req: Request) {
  try {
    const auth = await authenticateAdmin();
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const body: unknown = await req.json();
    const parse = userSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data gagal",
          errors: parse.error.flatten().fieldErrors, // Konsisten dengan route lain
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
    console.error("API POST User Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}

// ==========================================
// PATCH: UPDATE USER (Admin Only)
// ==========================================
export async function PATCH(req: Request) {
  try {
    const auth = await authenticateAdmin();
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const body: unknown = await req.json();
    const parse = patchUserSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: parse.error.flatten().fieldErrors,
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
    console.error("API PATCH User Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data user" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE: HAPUS USER (Admin Only)
// ==========================================
export async function DELETE(req: Request) {
  try {
    const auth = await authenticateAdmin();
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("id");

    if (!targetId || targetId.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ID pengguna tidak valid" },
        { status: 400 },
      );
    }

    // Mencegah admin "bunuh diri" (menghapus akunnya sendiri yang sedang aktif)
    if (targetId === auth.user!.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sistem menolak: Anda tidak dapat menghapus akun Anda sendiri",
        },
        { status: 403 },
      );
    }

    const deleted = await db
      .delete(users)
      .where(eq(users.id, targetId))
      .returning({ id: users.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pengguna tidak ditemukan di database",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus secara permanen",
    });
  } catch (error: unknown) {
    console.error("API DELETE User Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data pengguna" },
      { status: 500 },
    );
  }
}
