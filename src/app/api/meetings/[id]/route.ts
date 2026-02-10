import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabaseClient"; // PENTING: Jangan lupa import ini

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

// DELETE: Hapus Rapat & Foto Fisik di Supabase
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const meetingId = parseInt(id);

    // LANGKAH 1: Ambil data rapat dulu sebelum dihapus (untuk cek foto)
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId));

    if (!existingMeeting) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    // LANGKAH 2: Cek apakah ada foto, lalu hapus di Supabase
    if (existingMeeting.photos) {
      try {
        const photoUrls = JSON.parse(existingMeeting.photos);

        if (Array.isArray(photoUrls) && photoUrls.length > 0) {
          // Kita butuh nama filenya saja, bukan URL lengkap
          // Contoh URL: https://xyz.../notulen/1749283-foto.jpg -> Ambil: 1749283-foto.jpg
          const fileNames = photoUrls.map((url: string) => {
            return url.substring(url.lastIndexOf("/") + 1);
          });

          // Hapus file fisik di bucket 'notulen'
          const { error: storageError } = await supabase.storage
            .from("notulen")
            .remove(fileNames);

          if (storageError) {
            console.error("Gagal hapus file di storage:", storageError);
            // Kita lanjut saja hapus DB agar data tidak nyangkut
          }
        }
      } catch (parseError) {
        console.error("Gagal parsing JSON photos:", parseError);
      }
    }

    // LANGKAH 3: Hapus data di Database
    await db.delete(meetings).where(eq(meetings.id, meetingId));

    return NextResponse.json({
      success: true,
      message: "Data dan foto berhasil dihapus",
    });
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
