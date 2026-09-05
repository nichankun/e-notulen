import { db } from "@/db";
import { meetings, users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";

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
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Sesi tidak valid atau telah habis", status: 401 };
  }

  if (user.role !== "admin") {
    return {
      error: "Akses Ditolak: Hanya Administrator yang diizinkan",
      status: 403,
    };
  }

  return { user: { id: user.id } };
}

// ==========================================
// 2. ZOD SCHEMAS
// ==========================================
const userSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  nip: z.string().trim().min(5, "NIP minimal 5 karakter").max(50),
  password: z.string().min(6, "Password minimal 6 karakter").max(128),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().trim().min(2, "Instansi wajib diisi").max(200),
});

const patchUserSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(150),
  nip: z.string().trim().min(5, "NIP minimal 5 karakter").max(50),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().trim().min(2, "Instansi wajib diisi").max(200),
  password: z
    .union([
      z.string().min(6, "Password baru minimal 6 karakter").max(128),
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

    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak ditemukan" },
        { status: 404 },
      );
    }

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

    if (!targetId || !z.string().uuid().safeParse(targetId).success) {
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

    const [ownedMeeting] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(eq(meetings.userId, targetId))
      .limit(1);

    if (ownedMeeting) {
      return NextResponse.json(
        {
          success: false,
          message: "Pengguna masih memiliki rapat. Hapus atau pindahkan rapat terlebih dahulu.",
        },
        { status: 409 },
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
