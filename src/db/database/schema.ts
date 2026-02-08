import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  leader: text("leader"),
  // Default status 'live' agar saat create langsung masuk live mode
  status: text("status").default("live"),
  content: text("content"),
  attendanceCount: integer("attendance_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Meeting = InferSelectModel<typeof meetings>;
export type NewMeeting = InferInsertModel<typeof meetings>;
