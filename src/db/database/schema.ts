import {
  pgTable,
  text,
  timestamp,
  integer,
  unique,
  uuid, // Ditambahkan untuk tipe UUID
  pgEnum, // Ditambahkan untuk tipe Enum
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// --- ENUMS ---
// Inovasi: Mengunci nilai yang diizinkan di level database untuk mencegah typo atau data tidak valid
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
  id: uuid("id").primaryKey().defaultRandom(), // Inovasi: Menggunakan UUID
  nip: text("nip").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  agency: text("agency"),
  role: userRoleEnum("role").default("pegawai"), // Inovasi: Menggunakan Enum
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Inovasi: Otomatis ter-update saat ada modifikasi data
});

// 2. Tabel Rapat
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(), // Inovasi: Link rapat menjadi /dashboard/live/uuid yang tidak bisa ditebak
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  status: meetingStatusEnum("status").default("live"), // Inovasi: Menggunakan Enum
  content: text("content"),
  photos: text("photos"),
  attendanceCount: integer("attendance_count").default(0),
  userId: uuid("user_id").references(() => users.id, {
    // Diubah dari integer ke uuid menyesuaikan relasi
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()), // Inovasi: Berguna untuk melacak kapan notulen terakhir diedit
});

// 3. Tabel Peserta Absensi
export const attendees = pgTable(
  "attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    meetingId: uuid("meeting_id").references(() => meetings.id, {
      // Diubah dari integer ke uuid menyesuaikan relasi
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    nip: text("nip").notNull(),
    department: text("department"),
    signature: text("signature"),
    role: attendeeRoleEnum("role").default("peserta"), // Inovasi: Menggunakan Enum
    deviceId: text("device_id"),
    scannedAt: timestamp("scanned_at").defaultNow(),
    // Karena data absensi biasanya insert-only, updatedAt bersifat opsional, tapi saya tambahkan demi konsistensi
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
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
