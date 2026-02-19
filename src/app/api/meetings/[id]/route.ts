import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabaseClient";

interface UpdateMeetingRequest {
  content: string;
  status?: "live" | "completed";
  photos?: string[];
}

interface UpdatePayload {
  content: string;
  status?: "live" | "completed";
  photos?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const [data] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, parseInt(id)))
      .limit(1);

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Rapat tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = (await request.json()) as UpdateMeetingRequest;

    // TYPE SAFE: Menggunakan interface UpdatePayload tanpa 'any'
    const updateData: Partial<UpdatePayload> = {
      content: body.content,
    };

    if (body.status) updateData.status = body.status;
    if (body.photos) updateData.photos = JSON.stringify(body.photos);

    await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, parseInt(id)));
    return NextResponse.json({ success: true, message: "Rapat diperbarui" });
  } catch (error: unknown) {
    console.error("API PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal update data" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const meetingId = parseInt(id);
    const [existing] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data tidak ditemukan" },
        { status: 404 },
      );
    }

    if (existing.photos) {
      try {
        const photoUrls = JSON.parse(existing.photos) as string[];
        if (photoUrls.length > 0) {
          const fileNames = photoUrls
            .map((url) => url.split("/").pop())
            .filter((name): name is string => typeof name === "string");

          await supabase.storage.from("notulen").remove(fileNames);
        }
      } catch (e: unknown) {
        console.error("Storage Cleanup Error:", e);
      }
    }

    await db.delete(meetings).where(eq(meetings.id, meetingId));
    return NextResponse.json({
      success: true,
      message: "Data berhasil dihapus",
    });
  } catch (error: unknown) {
    console.error("API DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus data" },
      { status: 500 },
    );
  }
}
