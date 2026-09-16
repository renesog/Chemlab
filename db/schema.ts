import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liveRooms = sqliteTable("live_rooms", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  snapshot: text("snapshot").notNull(),
  teacherToken: text("teacher_token").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: integer("updated_at").notNull(),
});

export const liveStudentSessions = sqliteTable("live_student_sessions", {
  token: text("token").primaryKey(),
  roomId: text("room_id").notNull().references(()=>liveRooms.id,{onDelete:"cascade"}),
  studentId: text("student_id").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const liveRateLimits = sqliteTable("live_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(),
});
