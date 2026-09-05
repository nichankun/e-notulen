import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, asc, count, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { attendees, meetings } from "@/db/database/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  createAttendeeSessionToken,
  verifyAttendeeSessionToken,
  verifyMeetingAttendanceToken,
} from "@/lib/attendance-token";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const attendanceSchema = z.object({
  name: z.string().trim().min(3, "Nama lengkap wajib diisi").max(150),
  department: z.string().trim().max(150).optional(),
  role: z.enum(["pimpinan", "pejabat", "peserta"]),
  signature: z
    .string()
    .max(800_000, "Ukuran tanda tangan terlalu besar")
    .regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/, "Format tanda tangan tidak valid"),
  deviceId: z
    .string()
    .trim()
    .max(120)
    .regex(/^[A-Za-z0-9._-]+$/, "Identitas perangkat tidak valid")
    .optional(),
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MeetingAccess = {
  kind: "public" | "private";
  meeting: { id: string; status: "draft" | "live" | "archived" | "completed" | null };
};

async function getMeetingAccess(
  request: Request,
  meetingId: string,
): Promise<MeetingAccess | { error: string; status: number }> {
  if (!UUID_PATTERN.test(meetingId)) {
    return { error: "ID rapat tidak valid", status: 400 };
  }

  const token = new URL(request.url).searchParams.get("token");
  if (token) {
    if (!verifyMeetingAttendanceToken(meetingId, token)) {
      return { error: "Token presensi tidak valid atau sudah kedaluwarsa", status: 403 };
    }

    const [meeting] = await db
      .select({ id: meetings.id, status: meetings.status })
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .limit(1);

    if (!meeting) return { error: "Rapat tidak ditemukan", status: 404 };
    return { kind: "public", meeting };
  }

  const user = await getAuthenticatedUser();
  if (!user) return { error: "Sesi tidak valid", status: 401 };

  const condition =
    user.role === "admin"
      ? eq(meetings.id, meetingId)
      : and(eq(meetings.id, meetingId), eq(meetings.userId, user.id));
  const [meeting] = await db
    .select({ id: meetings.id, status: meetings.status })
    .from(meetings)
    .where(condition)
    .limit(1);

  if (!meeting) return { error: "Rapat tidak ditemukan atau akses ditolak", status: 404 };
  return { kind: "private", meeting };
}

function sessionCookieName(meetingId: string): string {
  return `attendance_session_${meetingId}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const meetingId = (await params).id;
    const access = await getMeetingAccess(request, meetingId);

    if ("error" in access) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status },
      );
    }

    if (
      access.meeting.status !== "live" &&
      (access.kind === "public" || access.meeting.status !== "archived")
    ) {
      return NextResponse.json(
        { success: false, message: "Akses rapat ditutup" },
        { status: 403 },
      );
    }

    if (access.kind === "public") {
      const limit = rateLimit(
        `attendance-read:${meetingId}:${getClientIp(request)}`,
        60,
        5 * 60 * 1000,
      );
      if (!limit.allowed) {
        return NextResponse.json(
          { success: false, message: "Terlalu banyak permintaan daftar hadir." },
          { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
        );
      }
    }

    const list = await db
      .select({
        id: attendees.id,
        name: attendees.name,
        department: attendees.department,
        role: attendees.role,
        scannedAt: attendees.scannedAt,
        signature: attendees.signature,
      })
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId))
      .orderBy(
        sql`CASE WHEN ${attendees.role} = 'pimpinan' THEN 1 WHEN ${attendees.role} = 'pejabat' THEN 2 ELSE 3 END`,
        asc(attendees.scannedAt),
      );

    const data =
      access.kind === "private"
        ? list
        : list.map(({ id, name, department, role, scannedAt }) => ({
            id,
            name,
            department,
            role,
            scannedAt,
          }));

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("API GET Attendees Error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const meetingId = (await params).id;
    const limit = rateLimit(
      `attendance:${meetingId}:${getClientIp(request)}`,
      20,
      15 * 60 * 1000,
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan presensi. Coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
      );
    }

    const access = await getMeetingAccess(request, meetingId);
    if ("error" in access) {
      return NextResponse.json(
        { success: false, message: access.error },
        { status: access.status },
      );
    }

    if (access.kind !== "public" || access.meeting.status !== "live") {
      return NextResponse.json(
        { success: false, message: "Sesi presensi tidak tersedia" },
        { status: 403 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 1_100_000) {
      return NextResponse.json(
        { success: false, message: "Data presensi terlalu besar" },
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > 1_100_000) {
      return NextResponse.json(
        { success: false, message: "Data presensi terlalu besar" },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Format data presensi tidak valid" },
        { status: 400 },
      );
    }

    const parse = attendanceSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap atau format tidak valid",
          errors: parse.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, department, role, signature, deviceId } = parse.data;
    const cookieStore = await cookies();
    const cookieName = sessionCookieName(meetingId);
    const existingId = verifyAttendeeSessionToken(
      meetingId,
      cookieStore.get(cookieName)?.value,
    );

    const attendeeId = await db.transaction(async (tx) => {
      // Serialize attendance writes per meeting so the denormalized counter
      // cannot lose increments when two devices submit at the same time.
      await tx
        .update(meetings)
        .set({ updatedAt: new Date() })
        .where(eq(meetings.id, meetingId));

      let targetId: string | null = null;

      if (existingId) {
        const [existing] = await tx
          .select({ id: attendees.id })
          .from(attendees)
          .where(and(eq(attendees.id, existingId), eq(attendees.meetingId, meetingId)))
          .limit(1);
        targetId = existing?.id ?? null;
      }

      if (!targetId && deviceId) {
        const [existing] = await tx
          .select({ id: attendees.id })
          .from(attendees)
          .where(
            and(
              eq(attendees.meetingId, meetingId),
              eq(attendees.deviceId, deviceId),
            ),
          )
          .limit(1);
        targetId = existing?.id ?? null;
      }

      if (targetId) {
        await tx
          .update(attendees)
          .set({
            name,
            department: department || "-",
            role,
            signature,
            scannedAt: new Date(),
          })
          .where(eq(attendees.id, targetId));
      } else {
        const [inserted] = await tx
          .insert(attendees)
          .values({
            meetingId,
            name,
            department: department || "-",
            role,
            signature,
            deviceId: deviceId || randomUUID(),
            scannedAt: new Date(),
          })
          .returning({ id: attendees.id });
        targetId = inserted.id;
      }

      const [stats] = await tx
        .select({ count: count() })
        .from(attendees)
        .where(eq(attendees.meetingId, meetingId));
      await tx
        .update(meetings)
        .set({ attendanceCount: stats.count })
        .where(eq(meetings.id, meetingId));

      return targetId;
    });

    const sessionToken = createAttendeeSessionToken(meetingId, attendeeId);
    cookieStore.set(cookieName, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: new URL(request.url).protocol === "https:",
      // The browser submits to /api, so a /attend-only cookie would not be sent.
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      message: "Berhasil mencatat kehadiran",
    });
  } catch (error: unknown) {
    console.error("API POST Attendee Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menyimpan absen" },
      { status: 500 },
    );
  }
}
