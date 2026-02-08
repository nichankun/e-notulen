import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { eq } from "drizzle-orm";

// GET: Ambil Detail Rapat (Untuk halaman Live)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const [data] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, parseInt(id)));

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Rapat tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    // FIX: Gunakan variabel 'error' untuk logging agar mudah debug
    console.error("API GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// PATCH: Update Rapat (Simpan Notulen & Finalisasi Status)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json(); // { content: "...", status: "completed" }

    await db
      .update(meetings)
      .set({
        content: body.content,
        status: body.status,
      })
      .where(eq(meetings.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "Rapat diperbarui" });
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// DELETE: Hapus Rapat (Untuk halaman Archive)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await db.delete(meetings).where(eq(meetings.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (error) {
    // FIX: Gunakan variabel 'error' untuk logging agar mudah debug
    console.error("API DELETE Error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
