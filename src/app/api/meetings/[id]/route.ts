import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, type NewMeeting } from "@/db/database/schema";
import { eq, and } from "drizzle-orm";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth"; // Utility auth kebanggaan kita
import { z } from "zod";

// 1. ZOD SCHEMA: Validasi data update yang masuk
const updateMeetingSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  photos: z.array(z.string()).optional(),
});

// FUNGSI BANTUAN OTENTIKASI AGAR DRY (Don't Repeat Yourself)
async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);

  // PERBAIKAN: Hapus isNaN() karena ID sekarang adalah string (UUID)
  if (!payload || !payload.id) return null;

  return {
    userId: String(payload.id),
    role: (payload.role as string) || "pegawai",
  };
}

// ==========================================
// GET: MENGAMBIL DETAIL 1 RAPAT
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    // PERBAIKAN: Ambil ID langsung sebagai string (UUID)
    const meetingId = (await params).id;
    if (!meetingId || meetingId.trim() === "")
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );

    // FILTER: Pegawai hanya boleh GET rapatnya sendiri. Admin bebas.
    const condition =
      user.role === "admin"
        ? eq(meetings.id, meetingId)
        : and(eq(meetings.id, meetingId), eq(meetings.userId, user.userId));

    const [data] = await db.select().from(meetings).where(condition).limit(1);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Rapat tidak ditemukan atau Anda tidak memiliki akses",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("API GET Detail Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// PATCH: MENGUBAH NOTULEN/STATUS
// ==========================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    // PERBAIKAN: Ambil ID langsung sebagai string (UUID)
    const meetingId = (await params).id;
    if (!meetingId || meetingId.trim() === "")
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );

    const body: unknown = await request.json();
    const parse = updateMeetingSchema.safeParse(body);

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

    const { content, status, photos } = parse.data;

    // SINKRONISASI: Gunakan Partial<NewMeeting> agar tipe data
    // selalu mengikuti definisi tabel di schema.ts secara otomatis.
    const updateData: Partial<NewMeeting> = {};

    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);

    // Pastikan payload tidak kosong sebelum membebani database
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diubah" },
        { status: 400 },
      );
    }

    const condition =
      user.role === "admin"
        ? eq(meetings.id, meetingId)
        : and(eq(meetings.id, meetingId), eq(meetings.userId, user.userId));

    const updated = await db
      .update(meetings)
      .set(updateData)
      .where(condition)
      .returning({ id: meetings.id });

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal update. Data tidak ditemukan atau akses ditolak.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rapat berhasil diperbarui",
    });
  } catch (error: unknown) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update data" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE: MENGHAPUS RAPAT & MEMBERSIHKAN STORAGE
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    // PERBAIKAN: Ambil ID langsung sebagai string (UUID)
    const meetingId = (await params).id;
    if (!meetingId || meetingId.trim() === "")
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );

    // FILTER OTORISASI DELETE
    const condition =
      user.role === "admin"
        ? eq(meetings.id, meetingId)
        : and(eq(meetings.id, meetingId), eq(meetings.userId, user.userId));

    const [existing] = await db
      .select()
      .from(meetings)
      .where(condition)
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan atau akses ditolak" },
        { status: 404 },
      );
    }

    // Eksekusi pembersihan file Supabase (Sangat Bagus!)
    if (existing.photos) {
      try {
        const photoUrls = JSON.parse(existing.photos) as string[];
        if (photoUrls.length > 0) {
          const fileNames = photoUrls
            .map((url) => url.split("/").pop())
            .filter((name): name is string => typeof name === "string");

          await supabase.storage.from("notulen").remove(fileNames);
        }
      } catch (e: unknown) {
        console.error("Storage Cleanup Error:", e);
      }
    }

    // Hapus dari Database
    await db.delete(meetings).where(condition);

    return NextResponse.json({
      success: true,
      message: "Data dan lampiran berhasil dihapus",
    });
  } catch (error: unknown) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
