import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 1. Tabel Rapat (Update Bagian Ini)
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  status: text("status").default("live"),
  content: text("content"),
  attendanceCount: integer("attendance_count").default(0),

  // --- TAMBAHKAN KOLOM INI ---
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade", // Jika user dihapus, rapatnya juga terhapus (opsional)
  }),

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

// 3. Tabel Users (Login)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nip: text("nip").notNull().unique(), // NIP sebagai Username
  password: text("password").notNull(), // Password
  name: text("name").notNull(),
  role: text("role").default("admin"), // admin / staff
  createdAt: timestamp("created_at").defaultNow(),
});

// --- EXPORT TIPE DATA ---

// 1. Tipe untuk SELECT (Data yang keluar dari DB, ada ID & CreatedAt)
export type Meeting = InferSelectModel<typeof meetings>;
export type Attendee = InferSelectModel<typeof attendees>;
export type User = InferSelectModel<typeof users>;

// 2. Tipe untuk INSERT (Data untuk input baru, ID biasanya tidak perlu)
// --> Bagian ini yang memperbaiki error "Unused" <--
export type NewMeeting = InferInsertModel<typeof meetings>;
export type NewAttendee = InferInsertModel<typeof attendees>;
export type NewUser = InferInsertModel<typeof users>;
