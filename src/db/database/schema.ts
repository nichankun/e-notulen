import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 1. Tabel Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nip: text("nip").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  agency: text("agency"),
  role: text("role").default("pegawai"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Tabel Rapat
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  status: text("status").default("live"), //
  content: text("content"),
  photos: text("photos"),
  attendanceCount: integer("attendance_count").default(0),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Tabel Peserta Absensi
export const attendees = pgTable(
  "attendees",
  {
    id: serial("id").primaryKey(),
    meetingId: integer("meeting_id").references(() => meetings.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    nip: text("nip").notNull(),
    department: text("department"),
    signature: text("signature"),
    role: text("role").default("peserta"), //
    deviceId: text("device_id"),
    scannedAt: timestamp("scanned_at").defaultNow(),
  },
  (table) => {
    return {
      uniqueNipPerMeeting: unique().on(table.meetingId, table.nip),
    };
  },
);

// --- EXPORT TIPE DATA ---
export type Meeting = InferSelectModel<typeof meetings>;
export type Attendee = InferSelectModel<typeof attendees>;
export type User = InferSelectModel<typeof users>;

export type NewMeeting = InferInsertModel<typeof meetings>;
export type NewAttendee = InferInsertModel<typeof attendees>;
export type NewUser = InferInsertModel<typeof users>;
