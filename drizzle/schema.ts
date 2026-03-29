import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Trip Media table — stores photo/video uploads per fishing trip
export const tripMedia = mysqlTable("tripMedia", {
  id: int("id").autoincrement().primaryKey(),
  tripNumber: int("tripNumber").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  url: text("url").notNull(),
  fileName: varchar("fileName", { length: 256 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  fileSize: int("fileSize").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type TripMedia = typeof tripMedia.$inferSelect;
export type InsertTripMedia = typeof tripMedia.$inferInsert;

// Trip Plan table — stores journey planning data per trip
export const tripPlan = mysqlTable("tripPlan", {
  id: int("id").autoincrement().primaryKey(),
  tripNumber: int("tripNumber").notNull().unique(),
  goNoGo: mysqlEnum("goNoGo", ["go", "no-go", "undecided"]).default("undecided").notNull(),
  prepNotes: text("prepNotes"),
  checklistJson: text("checklistJson"), // JSON array of { id, label, checked, category }
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripPlan = typeof tripPlan.$inferSelect;
export type InsertTripPlan = typeof tripPlan.$inferInsert;

// Roadmap task completion state — persists which tasks Gabe has checked off
export const roadmapTask = mysqlTable("roadmapTask", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 128 }).notNull().unique(),
  checked: int("checked").notNull().default(0), // 0 = unchecked, 1 = checked
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoadmapTask = typeof roadmapTask.$inferSelect;
export type InsertRoadmapTask = typeof roadmapTask.$inferInsert;