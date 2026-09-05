import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { createMeetingAttendanceToken } from "@/lib/attendance-token";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sesi tidak valid" },
      { status: 401 },
    );
  }

  const meetingId = (await params).id;
  const condition =
    user.role === "admin"
      ? eq(meetings.id, meetingId)
      : and(eq(meetings.id, meetingId), eq(meetings.userId, user.id));
  const [meeting] = await db
    .select({ id: meetings.id, status: meetings.status })
    .from(meetings)
    .where(condition)
    .limit(1);

  if (!meeting || meeting.status !== "live") {
    return NextResponse.json(
      { success: false, message: "Rapat tidak ditemukan atau sudah ditutup" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      token: createMeetingAttendanceToken(meetingId),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
