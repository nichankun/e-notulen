import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { meetings } from "@/db/database/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function getAuthorizedMeeting(meetingId: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Sesi tidak valid", status: 401 as const };

  const condition =
    user.role === "admin"
      ? eq(meetings.id, meetingId)
      : and(eq(meetings.id, meetingId), eq(meetings.userId, user.id));
  const [meeting] = await db
    .select({ id: meetings.id, photos: meetings.photos, status: meetings.status })
    .from(meetings)
    .where(condition)
    .limit(1);

  if (!meeting) return { error: "Rapat tidak ditemukan atau akses ditolak", status: 404 as const };
  return { user, meeting };
}

function getStoredPhotoPaths(photos: string | null): string[] {
  if (!photos) return [];
  try {
    const parsed = JSON.parse(photos);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function getStoragePath(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.origin !== process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const marker = "/storage/v1/object/public/notulen/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex >= 0) {
      return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    }
  } catch {
    // The database may contain a path from the new upload flow.
  }

  return /^[^/]+\.(?:jpg|jpeg|png|webp)$/i.test(value) ? value : null;
}

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  return file.type === "image/jpeg"
    ? isJpeg
    : file.type === "image/png"
      ? isPng
      : isWebp;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let uploadedStoragePath: string | null = null;

  try {
    const meetingId = (await params).id;
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 6 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Permintaan foto terlalu besar" },
        { status: 413 },
      );
    }
    const authorized = await getAuthorizedMeeting(meetingId);
    if ("error" in authorized) {
      return NextResponse.json(
        { success: false, message: authorized.error },
        { status: authorized.status },
      );
    }

    if (authorized.meeting.status !== "live") {
      return NextResponse.json(
        { success: false, message: "Foto hanya dapat ditambahkan saat rapat live" },
        { status: 409 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File foto wajib diisi" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Foto harus JPG, PNG, atau WebP maksimal 5 MB" },
        { status: 400 },
      );
    }

    if (!(await hasValidImageSignature(file))) {
      return NextResponse.json(
        { success: false, message: "Isi file bukan gambar yang valid" },
        { status: 400 },
      );
    }

    const currentPhotos = getStoredPhotoPaths(authorized.meeting.photos);
    if (currentPhotos.length >= 20) {
      return NextResponse.json(
        { success: false, message: "Maksimal 20 foto per rapat" },
        { status: 400 },
      );
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storagePath = `${meetingId}/${randomUUID()}.${extension}`;
    uploadedStoragePath = storagePath;
    const supabaseAdmin = getSupabaseAdmin();
    const { error: uploadError } = await supabaseAdmin.storage
      .from("notulen")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from("notulen").getPublicUrl(storagePath);
    const photos = [...currentPhotos, data.publicUrl];
    const expectedPhotos = authorized.meeting.photos;
    const photoCondition =
      expectedPhotos === null
        ? isNull(meetings.photos)
        : eq(meetings.photos, expectedPhotos);
    const updated = await db
      .update(meetings)
      .set({ photos: JSON.stringify(photos) })
      .where(
        and(
          eq(meetings.id, meetingId),
          eq(meetings.status, "live"),
          photoCondition,
        ),
      )
      .returning({ id: meetings.id });
    if (updated.length === 0) {
      throw new Error("PHOTO_CONFLICT");
    }
    uploadedStoragePath = null;

    return NextResponse.json({ success: true, url: data.publicUrl });
  } catch (error: unknown) {
    if (uploadedStoragePath) {
      try {
        await getSupabaseAdmin().storage
          .from("notulen")
          .remove([uploadedStoragePath]);
      } catch (cleanupError: unknown) {
        console.error("Uploaded photo cleanup failed", cleanupError);
      }
    }
    console.error("API POST Photo Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message === "PHOTO_CONFLICT"
            ? "Foto berubah bersamaan. Muat ulang rapat lalu coba lagi."
            : "Gagal mengunggah foto",
      },
      { status: error instanceof Error && error.message === "PHOTO_CONFLICT" ? 409 : 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const meetingId = (await params).id;
    const authorized = await getAuthorizedMeeting(meetingId);
    if ("error" in authorized) {
      return NextResponse.json(
        { success: false, message: authorized.error },
        { status: authorized.status },
      );
    }

    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return NextResponse.json(
        { success: false, message: "URL foto tidak valid" },
        { status: 400 },
      );
    }

    const storedPhotos = getStoredPhotoPaths(authorized.meeting.photos);
    if (!storedPhotos.includes(body.url)) {
      return NextResponse.json(
        { success: false, message: "Foto tidak ditemukan pada rapat ini" },
        { status: 404 },
      );
    }

    const storagePath = getStoragePath(body.url);
    const isLegacyPath = /^[^/]+\.(?:jpg|jpeg|png|webp)$/i.test(storagePath || "");
    if (!storagePath || (!storagePath.startsWith(`${meetingId}/`) && !isLegacyPath)) {
      return NextResponse.json(
        { success: false, message: "Lokasi foto tidak valid" },
        { status: 400 },
      );
    }

    const expectedPhotos = authorized.meeting.photos;
    const photoCondition =
      expectedPhotos === null
        ? isNull(meetings.photos)
        : eq(meetings.photos, expectedPhotos);
    const updated = await db
      .update(meetings)
      .set({ photos: JSON.stringify(storedPhotos.filter((photo) => photo !== body.url)) })
      .where(
        and(
          eq(meetings.id, meetingId),
          eq(meetings.status, "live"),
          photoCondition,
        ),
      )
      .returning({ id: meetings.id });
    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "Foto berubah bersamaan. Muat ulang rapat lalu coba lagi." },
        { status: 409 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: removeError } = await supabaseAdmin.storage
      .from("notulen")
      .remove([storagePath]);
    if (removeError) {
      console.error("Foto terhapus dari database tetapi cleanup storage gagal", removeError);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("API DELETE Photo Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus foto" },
      { status: 500 },
    );
  }
}
