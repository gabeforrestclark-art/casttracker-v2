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

// Social Post table — stores composed posts linked to roadmap tasks
export const socialPost = mysqlTable("socialPost", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 128 }).notNull(),
  caption: text("caption").notNull(),
  platforms: varchar("platforms", { length: 256 }).notNull(), // comma-separated: "instagram,facebook,tiktok"
  status: mysqlEnum("status", ["draft", "queued", "published", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  ayrsharePostId: varchar("ayrsharePostId", { length: 256 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialPost = typeof socialPost.$inferSelect;
export type InsertSocialPost = typeof socialPost.$inferInsert;

// Task notes table — stores per-task notes and completion timestamps
export const taskNote = mysqlTable("taskNote", {
  id: int("id").autoincrement().primaryKey(),
  taskId: varchar("taskId", { length: 128 }).notNull().unique(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskNote = typeof taskNote.$inferSelect;
export type InsertTaskNote = typeof taskNote.$inferInsert;

// Trip Catch Log — records actual catch data after each Saturday trip
export const tripCatch = mysqlTable("tripCatch", {
  id: int("id").autoincrement().primaryKey(),
  tripNumber: int("tripNumber").notNull().unique(),
  fishCaught: int("fishCaught").notNull().default(0),
  speciesJson: text("speciesJson"), // JSON: [{species, count, biggestInches}]
  waterTemp: varchar("waterTemp", { length: 32 }),
  weatherSummary: varchar("weatherSummary", { length: 128 }),
  windMph: int("windMph"),
  baitUsed: text("baitUsed"),
  launchTime: varchar("launchTime", { length: 32 }),
  hoursOnWater: varchar("hoursOnWater", { length: 32 }),
  gpsLat: varchar("gpsLat", { length: 32 }),
  gpsLng: varchar("gpsLng", { length: 32 }),
  personalNotes: text("personalNotes"),
  generatedCaption: text("generatedCaption"),
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TripCatch = typeof tripCatch.$inferSelect;
export type InsertTripCatch = typeof tripCatch.$inferInsert;

// Automation Log — records automation runs (donor checks, weather alerts, monthly reports)
export const automationLog = mysqlTable("automationLog", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 64 }).notNull(), // 'donor_check' | 'weather_alert' | 'monthly_report'
  status: mysqlEnum("status", ["success", "skipped", "error"]).notNull().default("success"),
  summary: text("summary"),
  runAt: timestamp("runAt").defaultNow().notNull(),
});

export type AutomationLog = typeof automationLog.$inferSelect;
export type InsertAutomationLog = typeof automationLog.$inferInsert;

// Social Accounts table — stores manually-updated follower counts per platform
export const socialAccounts = mysqlTable("socialAccounts", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull().unique(), // instagram, youtube, tiktok, facebook, twitter
  handle: varchar("handle", { length: 100 }).notNull().default(""),
  followers: int("followers").notNull().default(0),
  views: int("views").notNull().default(0),
  posts: int("posts").notNull().default(0),
  profileUrl: varchar("profileUrl", { length: 255 }).notNull().default(""),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;