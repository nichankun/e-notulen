import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { eq } from "drizzle-orm";

// 1. Definisikan Tipe Data Body dari Frontend (JSON)
interface RequestBody {
  content: string;
  status?: string;
  photos?: string[]; // Frontend mengirim Array string
}

// 2. Definisikan Tipe Data yang akan masuk ke Database
interface UpdatePayload {
  content?: string;
  status?: string;
  photos?: string; // Database menyimpan sebagai String JSON
}

// GET: Ambil Detail Rapat
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
    console.error("API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// PATCH: Update Rapat
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // Gunakan 'as RequestBody' untuk memberi tahu TS bentuk datanya
    const body = (await request.json()) as RequestBody;

    // Inisialisasi object dengan tipe UpdatePayload
    const updateData: UpdatePayload = {
      content: body.content,
    };

    // Update status jika ada
    if (body.status) {
      updateData.status = body.status;
    }

    // Update photos jika ada (Ubah Array jadi String JSON)
    if (body.photos && Array.isArray(body.photos)) {
      updateData.photos = JSON.stringify(body.photos);
    }

    await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "Rapat diperbarui" });
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update data" },
      { status: 500 },
    );
  }
}

// DELETE: Hapus Rapat
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
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
