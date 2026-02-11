import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq, sql, asc, and, ne } from "drizzle-orm";

/**
 * GET: Mengambil daftar hadir peserta rapat.
 * Digunakan untuk Live Dashboard dan Halaman Laporan (Result).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meetingId = parseInt(id);

  try {
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    // Validasi: Data hanya bisa diakses jika rapat 'live' atau sudah 'completed' (Arsip)
    if (
      !meeting ||
      (meeting.status !== "live" && meeting.status !== "completed")
    ) {
      return NextResponse.json(
        { success: false, message: "Akses daftar hadir ditutup." },
        { status: 403 },
      );
    }

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId))
      .orderBy(
        // 1. Urutan Prioritas: Pimpinan(1), Pejabat(2), Peserta(3)
        sql`CASE 
          WHEN ${attendees.role} = 'pimpinan' THEN 1 
          WHEN ${attendees.role} = 'pejabat' THEN 2 
          ELSE 3 
        END`,
        // 2. Urutan waktu scan (siapa cepat dia di atas dalam kategori yang sama)
        asc(attendees.scannedAt),
      );

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("API GET Attendees Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

/**
 * POST: Mencatat kehadiran peserta.
 * Memiliki fitur Anti-Titip Absen (Device Lock) dan Auto-Update (Upsert).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meetingId = parseInt(id);

  try {
    const body = await request.json();

    // 1. Validasi Input Wajib
    if (
      !body.name ||
      !body.signature ||
      !body.role ||
      !body.nip ||
      !body.deviceId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Informasi tidak lengkap atau ID perangkat tidak terdeteksi.",
        },
        { status: 400 },
      );
    }

    // 2. Cek Status Rapat: Harus 'live' untuk bisa mengisi absen
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    if (!meeting || meeting.status !== "live") {
      return NextResponse.json(
        { success: false, message: "Rapat belum dimulai atau sudah berakhir." },
        { status: 403 },
      );
    }

    // 3. PROTEKSI TITIP ABSEN (DEVICE CHECK)
    // Mencari apakah perangkat ini (deviceId) sudah digunakan oleh NIP LAIN di rapat yang sama
    const deviceUsedByOthers = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.deviceId, body.deviceId),
        ne(attendees.nip, body.nip), // NIP berbeda dari yang sedang diinput
      ),
    });

    if (deviceUsedByOthers) {
      return NextResponse.json(
        {
          success: false,
          message: "Maaf, satu perangkat hanya bisa digunakan untuk satu NIP.",
        },
        { status: 403 },
      );
    }

    // 4. LOGIKA UPSERT (1 NIP 1 DATA)
    // Cari apakah NIP ini sudah pernah absen di rapat ini sebelumnya
    const existingAttendee = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.nip, body.nip),
      ),
    });

    if (existingAttendee) {
      // UPDATE: Perbarui data jika orang yang sama mengisi kembali (misal ganti TTD)
      await db
        .update(attendees)
        .set({
          name: body.name,
          department: body.department || "-",
          role: body.role,
          signature: body.signature,
          deviceId: body.deviceId,
          scannedAt: new Date(),
        })
        .where(eq(attendees.id, existingAttendee.id));

      return NextResponse.json({
        success: true,
        message: "Data kehadiran Anda telah diperbarui.",
      });
    }

    // INSERT: Jika NIP dan Device benar-benar baru
    await db.insert(attendees).values({
      meetingId: meetingId,
      name: body.name,
      nip: body.nip,
      department: body.department || "-",
      role: body.role,
      signature: body.signature,
      deviceId: body.deviceId,
      scannedAt: new Date(),
    });

    // 5. Sinkronisasi Counter Kehadiran di tabel Rapat
    const stats = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId));

    await db
      .update(meetings)
      .set({ attendanceCount: Number(stats[0].count) })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({
      success: true,
      message: "Absensi berhasil dicatat.",
    });
  } catch (error) {
    console.error("API POST Attendee Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 },
    );
  }
}
