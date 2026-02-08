import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc } from "drizzle-orm"; // Sekarang 'desc' akan terpakai di fungsi GET

// 1. GET: Ambil Semua Data (Untuk List/Archive)
export async function GET() {
  try {
    const data = await db.select().from(meetings).orderBy(desc(meetings.date)); // <--- Disini 'desc' digunakan

    return NextResponse.json({ success: true, data: data }, { status: 200 });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// 2. POST: Buat Rapat Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input
    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan Tanggal wajib diisi" },
        { status: 400 },
      );
    }

    // Insert ke DB
    const [inserted] = await db
      .insert(meetings)
      .values({
        title: body.title,
        date: new Date(body.date),
        location: body.location || "",
        leader: body.leader || "",
        status: "live", // Force status live
        attendanceCount: 0,
      })
      .returning({ id: meetings.id });

    return NextResponse.json(
      { success: true, message: "Rapat berhasil dibuat", data: inserted },
      { status: 201 },
    );
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
