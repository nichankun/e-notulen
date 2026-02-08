import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq, desc } from "drizzle-orm";

// GET: Ambil daftar peserta real-time untuk rapat ini
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
    // FIX: Log error agar tidak 'unused' dan memudahkan debugging
    console.error("API GET Attendees Error:", error);

    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// POST: Simulasi Scan QR (User scan -> Masuk DB)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json(); // { name: "Nama Pegawai" }

    // 1. Simpan Peserta
    await db.insert(attendees).values({
      meetingId: parseInt(id),
      name: body.name || "Peserta Tanpa Nama",
      nip: body.nip || "-",
    });

    // 2. Update counter di tabel meeting
    const allAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, parseInt(id)));

    await db
      .update(meetings)
      .set({ attendanceCount: allAttendees.length })
      .where(eq(meetings.id, parseInt(id)));

    return NextResponse.json({ success: true, message: "Absensi berhasil" });
  } catch (error) {
    // FIX: Log error agar tidak 'unused' dan memudahkan debugging
    console.error("API POST Attendee Error:", error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
