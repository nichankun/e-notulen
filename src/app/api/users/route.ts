import { db } from "@/db";
import { users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

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
  password: z.string().optional().or(z.literal("")),
});

// Interface untuk Update Payload agar Type-Safe
interface UserUpdatePayload {
  name: string;
  nip: string;
  role: "admin" | "pegawai";
  agency: string;
  password?: string;
}

// --- METHOD POST: MEMBUAT USER BARU ---
export async function POST(req: Request) {
  try {
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

    return NextResponse.json({
      success: true,
      message: "Pegawai baru berhasil didaftarkan",
    });
  } catch (error: unknown) {
    // TYPE-SAFE ERROR HANDLING: Deteksi duplikasi NIP (Postgres Code 23505)
    if (error instanceof Object && "code" in error && error.code === "23505") {
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

// --- METHOD PATCH: UPDATE USER ---
export async function PATCH(req: Request) {
  try {
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

    // Inisialisasi payload update dengan tipe ketat
    const updateData: UserUpdatePayload = {
      name,
      nip,
      role,
      agency,
    };

    // Jika password diisi, lakukan hashing
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password baru minimal 6 karakter" },
          { status: 400 },
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
    });
  } catch (error: unknown) {
    if (error instanceof Object && "code" in error && error.code === "23505") {
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

// --- METHOD DELETE: HAPUS USER ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );
    }

    await db.delete(users).where(eq(users.id, Number(id)));

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
