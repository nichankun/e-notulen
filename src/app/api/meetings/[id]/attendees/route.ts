import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, attendees } from "@/db/database/schema";
import { eq, sql, asc, and, ne } from "drizzle-orm";

interface AttendancePostRequest {
  name: string;
  nip: string;
  department?: string;
  role: "pimpinan" | "pejabat" | "peserta";
  signature: string;
  deviceId: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meetingId = parseInt(id);

  try {
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
      columns: { status: true },
    });

    if (
      !meeting ||
      (meeting.status !== "live" && meeting.status !== "completed")
    ) {
      return NextResponse.json(
        { success: false, message: "Akses ditutup" },
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const meetingId = parseInt(id);

  try {
    const body = (await request.json()) as AttendancePostRequest;

    if (!body.name || !body.signature || !body.nip || !body.deviceId) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, meetingId),
    });

    if (!meeting || meeting.status !== "live") {
      return NextResponse.json(
        { success: false, message: "Absensi ditutup" },
        { status: 403 },
      );
    }

    const deviceUsedByOthers = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.deviceId, body.deviceId),
        ne(attendees.nip, body.nip),
      ),
    });

    if (deviceUsedByOthers) {
      return NextResponse.json(
        {
          success: false,
          message: "Perangkat sudah digunakan oleh NIP lain.",
        },
        { status: 403 },
      );
    }

    const existing = await db.query.attendees.findFirst({
      where: and(
        eq(attendees.meetingId, meetingId),
        eq(attendees.nip, body.nip),
      ),
    });

    if (existing) {
      await db
        .update(attendees)
        .set({
          name: body.name,
          department: body.department || "-",
          role: body.role,
          signature: body.signature,
          scannedAt: new Date(),
        })
        .where(eq(attendees.id, existing.id));
    } else {
      await db.insert(attendees).values({
        meetingId,
        name: body.name,
        nip: body.nip,
        department: body.department || "-",
        role: body.role,
        signature: body.signature,
        deviceId: body.deviceId,
        scannedAt: new Date(),
      });
    }

    const [stats] = await db
      .select({
        count: sql<number>`cast(count(*) as int)`,
      })
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
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
