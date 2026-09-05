import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings, type NewMeeting } from "@/db/database/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { sanitizeSummaryHtml } from "@/lib/sanitize-html";
import { meetingSummarySchema } from "@/lib/meeting-summary-schema";
import { z } from "zod";

// ==========================================
// 1. ZOD SCHEMA
// ==========================================
const updateMeetingSchema = z.object({
  content: z.string().max(200_000).optional(),
  status: z.enum(["draft", "live", "archived"]).optional(),
  transcript: z.string().max(200_000).optional(),
  summaryHtml: z.string().max(50_000).optional(),
  summaryData: meetingSummarySchema.nullable().optional(),
});

// ==========================================
// 2. HELPER: OTENTIKASI & KONDISI QUERY
// ==========================================
async function authenticateRequest() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Sesi tidak valid atau telah habis", status: 401 };

  return {
    user: {
      id: user.id,
      role: user.role,
    },
  };
}

function getAuthCondition(meetingId: string, userId: string, role: string) {
  return role === "admin"
    ? eq(meetings.id, meetingId)
    : and(eq(meetings.id, meetingId), eq(meetings.userId, userId));
}

// ==========================================
// GET: MENGAMBIL DETAIL 1 RAPAT
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );
    const [data] = await db.select().from(meetings).where(condition).limit(1);

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Rapat tidak ditemukan atau Anda tidak memiliki akses",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("API GET Detail Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// ==========================================
// PATCH: MENGUBAH NOTULEN/STATUS/TRANSCRIPT/SUMMARY
// ==========================================
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const body: unknown = await request.json();
    const parse = updateMeetingSchema.safeParse(body);

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

    const { content, status, transcript, summaryHtml, summaryData } = parse.data;
    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );
    const [currentMeeting] = await db
      .select({ id: meetings.id, status: meetings.status })
      .from(meetings)
      .where(condition)
      .limit(1);

    if (!currentMeeting) {
      return NextResponse.json(
        { success: false, message: "Rapat tidak ditemukan atau akses ditolak." },
        { status: 404 },
      );
    }

    if (currentMeeting.status === "archived" || currentMeeting.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Rapat yang sudah diarsipkan tidak dapat diubah." },
        { status: 409 },
      );
    }

    if (
      status !== undefined &&
      status !== currentMeeting.status &&
      !(
        (currentMeeting.status === "draft" &&
          (status === "live" || status === "archived")) ||
        (currentMeeting.status === "live" && status === "archived")
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Perubahan status rapat tidak diizinkan." },
        { status: 409 },
      );
    }

    const updateData: Partial<NewMeeting> = {};

    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (transcript !== undefined) updateData.transcript = transcript;
    if (summaryHtml !== undefined) {
      updateData.summaryHtml = sanitizeSummaryHtml(summaryHtml);
    }
    if (summaryData !== undefined) updateData.summaryData = summaryData;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diubah" },
        { status: 400 },
      );
    }

    const updated = await db
      .update(meetings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(condition)
      .returning({ id: meetings.id });

    if (updated.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal update. Data tidak ditemukan atau akses ditolak.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rapat berhasil diperbarui",
    });
  } catch (error: unknown) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update data" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE: MENGHAPUS RAPAT & MEMBERSIHKAN STORAGE
// ==========================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticateRequest();
    if (auth.error)
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );

    const meetingId = (await params).id;
    if (!meetingId)
      return NextResponse.json(
        { success: false, message: "ID rapat tidak valid" },
        { status: 400 },
      );

    const condition = getAuthCondition(
      meetingId,
      auth.user!.id,
      auth.user!.role,
    );

    const [existing] = await db
      .select()
      .from(meetings)
      .where(condition)
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan atau akses ditolak" },
        { status: 404 },
      );
    }

    if (existing.photos) {
      try {
        const photoUrls = JSON.parse(existing.photos) as string[];
        if (photoUrls.length > 0) {
          const fileNames = photoUrls
            .map((url) => {
              try {
                const parsed = new URL(url);
                if (parsed.origin !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
                  return null;
                }
                const marker = "/storage/v1/object/public/notulen/";
                const markerIndex = parsed.pathname.indexOf(marker);
                return markerIndex >= 0
                  ? decodeURIComponent(
                      parsed.pathname.slice(markerIndex + marker.length),
                    )
                  : null;
              } catch {
                return null;
              }
            })
            .filter((name): name is string => Boolean(name));

          if (fileNames.length > 0) {
            const supabaseAdmin = getSupabaseAdmin();
            const { error: storageError } = await supabaseAdmin.storage
              .from("notulen")
              .remove(fileNames);
            if (storageError) throw storageError;
          }
        }
      } catch (e: unknown) {
        console.error("Storage Cleanup Error:", e);
        return NextResponse.json(
          { success: false, message: "Penghapusan dibatalkan karena lampiran gagal dibersihkan" },
          { status: 502 },
        );
      }
    }

    await db.delete(meetings).where(condition);

    return NextResponse.json({
      success: true,
      message: "Data dan lampiran berhasil dihapus",
    });
  } catch (error: unknown) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
