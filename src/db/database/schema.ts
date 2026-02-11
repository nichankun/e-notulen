import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 1. Tabel Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nip: text("nip").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),

  // --- TAMBAHAN BARU: Field Instansi ---
  agency: text("agency"),
  // -------------------------------------

  role: text("role").default("pegawai"), // Default saya ubah ke pegawai agar aman
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Tabel Rapat (Tidak ada perubahan, tetap disertakan agar lengkap)
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  status: text("status").default("live"),
  content: text("content"),
  photos: text("photos"), // JSON String array URL foto
  attendanceCount: integer("attendance_count").default(0),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Tabel Peserta Absensi (Tidak ada perubahan)
export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").references(() => meetings.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  nip: text("nip"),
  scannedAt: timestamp("scanned_at").defaultNow(),
  department: text("department"),
  signature: text("signature"),
});

// --- EXPORT TIPE DATA ---
export type Meeting = InferSelectModel<typeof meetings>;
export type Attendee = InferSelectModel<typeof attendees>;
export type User = InferSelectModel<typeof users>;

export type NewMeeting = InferInsertModel<typeof meetings>;
export type NewAttendee = InferInsertModel<typeof attendees>;
export type NewUser = InferInsertModel<typeof users>;
