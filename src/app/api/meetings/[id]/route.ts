import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, type NewMeeting } from "@/db/database/schema";
import { eq, and } from "drizzle-orm";
import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { z } from "zod";

// ==========================================
// 1. ZOD SCHEMA
// ==========================================
const updateMeetingSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  photos: z.array(z.string()).optional(),
});

// ==========================================
// 2. HELPER: OTENTIKASI & KONDISI QUERY
// ==========================================
async function authenticateRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token)
    return { error: "Sesi tidak valid atau telah habis", status: 401 };

  const payload = await verifyAuthToken(token);
  if (!payload || !payload.id)
    return { error: "Akses ditolak (Unauthorized)", status: 401 };

  return {
    user: {
      id: String(payload.id),
      role: (payload.role as string) || "pegawai",
    },
  };
}

// Mengekstrak logika otorisasi agar tidak diulang di GET, PATCH, dan DELETE
function getAuthCondition(meetingId: string, userId: string, role: string) {
  return role === "admin"
    ? eq(meetings.id, meetingId) // Admin bebas akses ID apa saja
    : and(eq(meetings.id, meetingId), eq(meetings.userId, userId)); // Pegawai hanya miliknya
}

// ==========================================
// GET: MENGAMBIL DETAIL 1 RAPAT
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );
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

// ==========================================
// PATCH: MENGUBAH NOTULEN/STATUS
// ==========================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const body: unknown = await request.json();
    const parse = updateMeetingSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data gagal",
          errors: parse.error.flatten().fieldErrors, // Konsisten dengan format error Zod
        },
        { status: 400 },
      );
    }

    const { content, status, photos } = parse.data;
    const updateData: Partial<NewMeeting> = {};

    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diubah" },
        { status: 400 },
      );
    }

    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );
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
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );

    // Ambil data untuk mengecek lampiran foto
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

    // Pembersihan file Supabase yang sangat efisien
    if (existing.photos) {
      try {
        const photoUrls = JSON.parse(existing.photos) as string[];
        if (photoUrls.length > 0) {
          const fileNames = photoUrls
            .map((url) => url.split("/").pop())
            .filter((name): name is string => Boolean(name)); // Perbaikan filter strict boolean

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
