import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq, sql, asc, and, ne, count } from "drizzle-orm";
import { z } from "zod";

// 1. ZOD SCHEMA
const attendanceSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  department: z.string().optional(),
  role: z.enum(["pimpinan", "pejabat", "peserta"]),
  signature: z.string().min(1, "Tanda tangan digital wajib diisi"),
  deviceId: z.string().min(1, "Gagal mengidentifikasi perangkat"),
});

// ==========================================
// GET: MENGAMBIL DAFTAR HADIR
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const meetingId = (await params).id;

    if (!meetingId || meetingId.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ID Rapat tidak valid" },
        { status: 400 },
      );
    }

    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
      columns: { status: true },
    });

    if (
      !meeting ||
      (meeting.status !== "live" && meeting.status !== "archived")
    ) {
      return NextResponse.json(
        { success: false, message: "Akses rapat ditutup" },
        { status: 403 },
      );
    }

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId))
      .orderBy(
        sql`CASE 
          WHEN ${attendees.role} = 'pimpinan' THEN 1 
          WHEN ${attendees.role} = 'pejabat' THEN 2 
          ELSE 3 
        END`,
        asc(attendees.scannedAt),
      );

    return NextResponse.json({ success: true, data: list });
  } catch (error: unknown) {
    console.error("API GET Attendees Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

// ==========================================
// POST: MENGIRIM DATA ABSENSI DARI HP PESERTA
// ==========================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const meetingId = (await params).id;

    if (!meetingId || meetingId.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ID Rapat tidak valid" },
        { status: 400 },
      );
    }

    // VALIDASI ZOD
    const body: unknown = await request.json();
    const parse = attendanceSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap",
          errors: parse.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Ekstrak data tanpa nip
    const { name, department, role, signature, deviceId } = parse.data;

    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    if (!meeting || meeting.status !== "live") {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi absensi untuk rapat ini telah ditutup",
        },
        { status: 403 },
      );
    }

    // FITUR ANTI-FRAUD
    const deviceUsedByOthers = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.deviceId, deviceId),
        ne(attendees.name, name),
      ),
    });

    if (deviceUsedByOthers) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Perangkat ini sudah digunakan untuk absen pegawai lain. Gunakan perangkat Anda sendiri.",
        },
        { status: 403 },
      );
    }

    // UPSERT LOGIC
    const existing = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.deviceId, deviceId),
      ),
    });

    if (existing) {
      await db
        .update(attendees)
        .set({
          name,
          department: department || "-",
          role,
          signature,
          scannedAt: new Date(),
        })
        .where(eq(attendees.id, existing.id));
    } else {
      // INSERT tanpa nip
      await db.insert(attendees).values({
        meetingId,
        name,
        department: department || "-",
        role,
        signature,
        deviceId,
        scannedAt: new Date(),
      });
    }

    // UPDATE TOTAL HADIR
    const [stats] = await db
      .select({ count: count() })
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId));

    await db
      .update(meetings)
      .set({ attendanceCount: stats.count })
      .where(eq(meetings.id, meetingId));

    return NextResponse.json({
      success: true,
      message: "Berhasil mencatat kehadiran",
    });
  } catch (error: unknown) {
    console.error("API POST Attendee Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan sistem saat menyimpan absen",
      },
      { status: 500 },
    );
  }
}
