import {
  pgTable,
  text,
  timestamp,
  integer,
  unique,
  uuid,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import type { MeetingSummary } from "@/lib/meeting-summary";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", ["admin", "pegawai"]);
export const meetingStatusEnum = pgEnum("meeting_status", [
  "draft",
  "live",
  "archived",
  "completed",
]);
export const attendeeRoleEnum = pgEnum("attendee_role", [
  "pimpinan",
  "pejabat",
  "peserta",
]);

// 1. Tabel Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  nip: text("nip").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  agency: text("agency"),
  role: userRoleEnum("role").default("pegawai"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 2. Tabel Rapat
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),

  // ── Kolom identitas rapat ────────────────────────────────────────
  invitationNumber: text("invitation_number"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  secretary: text("secretary"),
  recorder: text("recorder"),
  leaderTitle: text("leader_title"),
  leaderRank: text("leader_rank"),
  // ────────────────────────────────────────────────────────────────

  status: meetingStatusEnum("status").default("live"),
  content: text("content"),
  photos: text("photos"),

  // ── Kolom rekaman & AI ───────────────────────────────────────────
  transcript: text("transcript"), // Raw transkrip dari rekaman
  summaryHtml: text("summary_html"), // Rangkuman AI dalam format HTML
  summaryData: jsonb("summary_data").$type<MeetingSummary | null>(),
  // ────────────────────────────────────────────────────────────────

  attendanceCount: integer("attendance_count").default(0),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "restrict",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 3. Tabel Peserta Absensi
export const attendees = pgTable(
  "attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id").references(() => meetings.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    department: text("department"),
    signature: text("signature"),
    role: attendeeRoleEnum("role").default("peserta"),
    deviceId: text("device_id"),
    scannedAt: timestamp("scanned_at").defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueDevicePerMeeting: unique().on(table.meetingId, table.deviceId),
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
