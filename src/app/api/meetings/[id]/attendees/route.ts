import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq, desc } from "drizzle-orm";

// GET: Ambil daftar peserta (termasuk tanda tangan & instansi)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, parseInt(id)))
      .orderBy(desc(attendees.scannedAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("API GET Attendees Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST: Simpan Absensi Baru (Lengkap)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Validasi sederhana
    if (!body.name || !body.signature) {
      return NextResponse.json(
        { success: false, message: "Nama dan Tanda Tangan wajib diisi" },
        { status: 400 },
      );
    }

    // 1. Simpan Peserta ke Database
    await db.insert(attendees).values({
      meetingId: parseInt(id),
      name: body.name,
      nip: body.nip || "-",
      // --- TAMBAHAN BARU ---
      department: body.department || "-", // Simpan Instansi
      signature: body.signature, // Simpan Base64 Tanda Tangan
      // ---------------------
    });

    // 2. Update counter jumlah hadir di tabel meeting
    // (Cara ini memastikan jumlah sinkron dengan data asli)
    const allAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, parseInt(id)));

    await db
      .update(meetings)
      .set({ attendanceCount: allAttendees.length })
      .where(eq(meetings.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil disimpan",
    });
  } catch (error) {
    console.error("API POST Attendee Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan ke database" },
      { status: 500 },
    );
  }
}
