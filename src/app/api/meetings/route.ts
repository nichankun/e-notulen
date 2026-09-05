import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { desc, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseMeetingDateTime } from "@/lib/timezone";
import { z } from "zod";

// ==========================================
// 1. ZOD SCHEMA (Validasi Input)
// ==========================================
const createMeetingSchema = z.object({
  title: z.string().trim().min(5, "Judul rapat minimal 5 karakter").max(200),
  date: z
    .string()
    .min(1, "Tanggal wajib diisi")
    .refine((val) => {
      try {
        parseMeetingDateTime(val);
        return true;
      } catch {
        return false;
      }
    }, "Format tanggal tidak valid"),
  location: z.string().trim().min(3, "Lokasi minimal 3 karakter").max(200),
  leader: z.string().trim().min(3, "Nama pimpinan minimal 3 karakter").max(200),
  invitationNumber: z.string().trim().max(200).optional(),
  startTime: z
    .string()
    .trim()
    .refine((val) => !val || /^(?:[01]\d|2[0-3])\.[0-5]\d$/.test(val), {
      message: "Format jam tidak valid",
    })
    .optional(),
  endTime: z
    .string()
    .trim()
    .refine((val) => !val || /^(?:[01]\d|2[0-3])\.[0-5]\d$/.test(val), {
      message: "Format jam tidak valid",
    })
    .optional(),
  secretary: z.string().trim().max(200).optional(),
  recorder: z.string().trim().max(200).optional(),
  leaderTitle: z.string().trim().max(200).optional(),
  leaderRank: z.string().trim().max(200).optional(),
});

// ==========================================
// 2. HELPER: OTENTIKASI & VALIDASI SESI
// ==========================================
// Definisi tipe return agar TypeScript tidak bingung
type AuthResult =
  | { user: { id: string; role: string }; error: null }
  | { user: null; error: string; status: number };

async function authenticateRequest(): Promise<AuthResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { user: null, error: "Sesi tidak valid", status: 401 };
  }

  return {
    user: {
      id: user.id,
      role: user.role,
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

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
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

    const {
      title,
      date,
      location,
      leader,
      invitationNumber,
      startTime,
      endTime,
      secretary,
      recorder,
      leaderTitle,
      leaderRank,
    } = parse.data;

    // SIMPAN KE DATABASE
    const [inserted] = await db
      .insert(meetings)
      .values({
        title,
        date: parseMeetingDateTime(date),
        location,
        leader,
        invitationNumber: invitationNumber || null,
        startTime: startTime || null,
        endTime: endTime || null,
        secretary: secretary || null,
        recorder: recorder || null,
        leaderTitle: leaderTitle || null,
        leaderRank: leaderRank || null,
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
