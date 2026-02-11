import { db } from "@/db";
import { users } from "@/db/database/schema";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// 1. SCHEMA VALIDASI POST (Create)
const userSchema = z.object({
  name: z.string().min(3),
  nip: z.string().min(5),
  password: z.string().min(6),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2, "Instansi wajib diisi"),
});

const patchUserSchema = z.object({
  id: z.number(),
  name: z.string().min(3),
  nip: z.string().min(5),
  role: z.enum(["admin", "pegawai"]),
  agency: z.string().min(2),
  password: z.string().optional().or(z.literal("")),
});

interface UserUpdateData {
  name: string;
  nip: string;
  role: "admin" | "pegawai";
  agency: string;
  password?: string;
}

// --- METHOD POST: MEMBUAT USER BARU ---
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown; // Cast ke unknown dulu sebelum parse

    // Validasi Zod
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

    // Hashing Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke DB
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

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as unknown;

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

    const updateData: UserUpdateData = {
      name,
      nip,
      role,
      agency,
    };

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
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data user" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID tidak ditemukan" },
        { status: 400 },
      );
    }

    await db.delete(users).where(eq(users.id, Number(id)));

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus permanen",
    });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus user" },
      { status: 500 },
    );
  }
}
