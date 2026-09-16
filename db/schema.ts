import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liveRooms = sqliteTable("live_rooms", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  snapshot: text("snapshot").notNull(),
  teacherToken: text("teacher_token").notNull(),
  ownerUserId: text("owner_user_id"),
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

export const teacherProfiles = sqliteTable("teacher_profiles", {
  userId: text("user_id").primaryKey(),
  nickname: text("nickname").notNull(),
  avatar: text("avatar").notNull().default("flask"),
  color: text("color").notNull().default("cyan"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const liveRoomAnswerKeys = sqliteTable("live_room_answer_keys", {
  roomId: text("room_id").primaryKey().references(()=>liveRooms.id,{onDelete:"cascade"}),
  answersJson: text("answers_json").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
