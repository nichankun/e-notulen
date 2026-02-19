import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

// Define strict interface for POST body
interface CreateMeetingRequest {
  title: string;
  date: string;
  location?: string;
  leader?: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_token")?.value;
    const role = cookieStore.get("user_role")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const query = db
      .select({
        id: meetings.id,
        title: meetings.title,
        date: meetings.date,
        location: meetings.location,
        leader: meetings.leader,
        status: meetings.status,
        attendanceCount: meetings.attendanceCount,
      })
      .from(meetings);

    const data =
      role === "admin"
        ? await query.orderBy(desc(meetings.date))
        : await query
            .where(eq(meetings.userId, Number(userId)))
            .orderBy(desc(meetings.date));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_token")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Sesi habis" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CreateMeetingRequest;

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan Tanggal wajib diisi" },
        { status: 400 },
      );
    }

    const [inserted] = await db
      .insert(meetings)
      .values({
        title: body.title,
        date: new Date(body.date),
        location: body.location || "",
        leader: body.leader || "",
        status: "live",
        attendanceCount: 0,
        userId: Number(userId),
      })
      .returning({ id: meetings.id });

    return NextResponse.json(
      { success: true, message: "Rapat berhasil dibuat", data: inserted },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data" },
      { status: 500 },
    );
  }
}
