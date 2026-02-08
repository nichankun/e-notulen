import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 1. Tabel Rapat
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  status: text("status").default("live"),
  content: text("content"),
  attendanceCount: integer("attendance_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Tabel Peserta Absensi
export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").references(() => meetings.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  nip: text("nip"),
  scannedAt: timestamp("scanned_at").defaultNow(),
});

// 3. Export Tipe Data (Select & Insert)
// Tipe untuk data yang diambil dari DB (sudah ada ID, createdAt, dll)
export type Meeting = InferSelectModel<typeof meetings>;
export type Attendee = InferSelectModel<typeof attendees>;

// Tipe untuk data baru yang akan diinput (ID biasanya belum ada)
// INI YANG KURANG TADI:
export type NewMeeting = InferInsertModel<typeof meetings>;
export type NewAttendee = InferInsertModel<typeof attendees>;
