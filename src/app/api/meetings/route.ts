import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm"; // 1. Import eq untuk filter
import { cookies } from "next/headers"; // 2. Import cookies

// 1. GET: Ambil Data Berdasarkan Role
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

    let data;

    if (role === "admin") {
      // Admin: Ambil semua data rapat
      data = await db.select().from(meetings).orderBy(desc(meetings.date));
    } else {
      // Staff/Pegawai: Ambil hanya yang kolom user_id nya cocok dengan ID dia
      data = await db
        .select()
        .from(meetings)
        .where(eq(meetings.userId, Number(userId))) // Filter di DB
        .orderBy(desc(meetings.date));
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// 2. POST: Buat Rapat Baru & Simpan ID Pembuatnya
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("auth_token")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Sesi habis, silakan login kembali" },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, message: "Judul dan Tanggal wajib diisi" },
        { status: 400 },
      );
    }

    // Insert ke DB dengan menyertakan userId pembuatnya
    const [inserted] = await db
      .insert(meetings)
      .values({
        title: body.title,
        date: new Date(body.date),
        location: body.location || "",
        leader: body.leader || "",
        status: "live",
        attendanceCount: 0,
        userId: Number(userId), // <--- POINT PENTING: Menghubungkan rapat dengan user pembuat
      })
      .returning({ id: meetings.id });

    return NextResponse.json(
      { success: true, message: "Rapat berhasil dibuat", data: inserted },
      { status: 201 },
    );
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data ke database" },
      { status: 500 },
    );
  }
}
