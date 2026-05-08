import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";
import { z } from "zod";

// ==========================================
// 1. ZOD SCHEMA (Validasi Input)
// ==========================================
const createMeetingSchema = z.object({
  title: z.string().min(5, "Judul rapat minimal 5 karakter"),
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
// 2. HELPER: OTENTIKASI & VALIDASI SESI
// ==========================================
// Definisi tipe return agar TypeScript tidak bingung
type AuthResult =
  | { user: { id: string; role: string }; error: null }
  | { user: null; error: string; status: number };

async function authenticateRequest(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {
      user: null,
      error: "Sesi habis atau tidak memiliki akses",
      status: 401,
    };
  }

  const payload = await verifyAuthToken(token);
  if (!payload || !payload.id) {
    return { user: null, error: "Sesi tidak valid", status: 401 };
  }

  const userId = String(payload.id);
  if (!userId || userId.trim() === "" || userId === "undefined") {
    return { user: null, error: "Identitas pengguna tidak valid", status: 400 };
  }

  return {
    user: {
      id: userId,
      role: (payload.role as string) || "pegawai",
    },
    error: null,
  };
}

// ==========================================
// GET: MENGAMBIL DAFTAR RAPAT
// ==========================================
export async function GET() {
  try {
    const auth = await authenticateRequest();

    // Penanganan error tanpa non-null assertion (!)
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { id: userId, role } = auth.user;

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
    const auth = await authenticateRequest();

    if (auth.error || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { id: userId } = auth.user;

    // VALIDASI BODY MENGGUNAKAN ZOD
    const body: unknown = await request.json();
    const parse = createMeetingSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi data gagal",
          errors: parse.error.flatten().fieldErrors,
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
        date: new Date(date), // Memastikan string tanggal diconvert ke objek Date
        location,
        leader,
        status: "live",
        attendanceCount: 0,
        userId,
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
