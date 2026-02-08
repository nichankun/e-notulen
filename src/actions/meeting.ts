"use server";

import { db } from "@/db";
import { meetings } from "@/db/database/schema";
// Hapus import redirect

export async function createMeeting(formData: FormData) {
  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const location = formData.get("location") as string;
  const leader = formData.get("leader") as string;

  if (!title || !dateStr) {
    return { success: false, message: "Judul dan Tanggal wajib diisi" };
  }

  try {
    const [inserted] = await db
      .insert(meetings)
      .values({
        title,
        date: new Date(dateStr),
        location,
        leader,
        status: "live",
        attendanceCount: 0,
      })
      .returning({ id: meetings.id });

    // JANGAN redirect disini. Return data sukses saja.
    return { success: true, meetingId: inserted.id };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Gagal menyimpan ke database." };
  }
}
