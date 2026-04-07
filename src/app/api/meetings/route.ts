import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth"; // PENTING: Gunakan utility kita!
import { z } from "zod";

// 1. ZOD SCHEMA: Validasi input yang lebih ketat & aman
const createMeetingSchema = z.object({
  title: z.string().min(5, "Judul rapat minimal 5 karakter"),
  // Memastikan format tanggal bisa di-parse oleh JavaScript Date
  date: z
    .string()
    .min(1, "Tanggal wajib diisi")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Format tanggal tidak valid",
    }),
  location: z.string().min(3, "Lokasi minimal 3 karakter"),
  leader: z.string().min(3, "Nama pimpinan minimal 3 karakter"),
});

// ==========================================
// GET: MENGAMBIL DAFTAR RAPAT
// ==========================================
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // BONGKAR JWT: Ambil ID dan Role yang asli & aman
    const payload = await verifyAuthToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    // PERBAIKAN: Ubah ke String untuk UUID
    const userId = String(payload.id);
    const role = (payload.role as string) || "pegawai";

    // PERBAIKAN: Cegah string kosong atau undefined
    if (!userId || userId.trim() === "" || userId === "undefined") {
      return NextResponse.json(
        { success: false, message: "ID User invalid" },
        { status: 400 },
      );
    }

    // BASE QUERY
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

    // EKSEKUSI QUERY BERDASARKAN ROLE
    const data =
      role === "admin"
        ? await query.orderBy(desc(meetings.date)) // Admin lihat semua
        : await query
            .where(eq(meetings.userId, userId))
            .orderBy(desc(meetings.date)); // Pegawai lihat miliknya

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("API GET Meetings Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data rapat" },
      { status: 500 },
    );
  }
}

// ==========================================
// POST: MEMBUAT RAPAT BARU
// ==========================================
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Sesi habis" },
        { status: 401 },
      );
    }

    // BONGKAR JWT UNTUK MENDAPATKAN USER ID
    const payload = await verifyAuthToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid" },
        { status: 401 },
      );
    }

    // PERBAIKAN: Ubah ke String untuk UUID
    const userId = String(payload.id);

    // PERBAIKAN: Validasi string kosong/undefined
    if (!userId || userId.trim() === "" || userId === "undefined") {
      return NextResponse.json(
        { success: false, message: "ID User invalid" },
        { status: 400 },
      );
    }

    // VALIDASI BODY MENGGUNAKAN ZOD
    const body: unknown = await request.json();
    const parse = createMeetingSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parse.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { title, date, location, leader } = parse.data;

    // SIMPAN KE DATABASE
    const [inserted] = await db
      .insert(meetings)
      .values({
        title,
        date: new Date(date), // Aman karena sudah divalidasi Zod
        location: location || "",
        leader: leader || "",
        status: "live",
        attendanceCount: 0,
        userId: userId, // Pasti UUID String yang valid
      })
      .returning({ id: meetings.id });

    return NextResponse.json(
      {
        success: true,
        message: "Agenda rapat berhasil dibuat",
        data: inserted,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("API POST Meetings Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data agenda" },
      { status: 500 },
    );
  }
}
