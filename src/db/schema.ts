import { pgTable, uuid, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== 核心表 ====================

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),
  currentSlide: integer("current_slide").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const slides = pgTable("slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id),
  pageNumber: integer("page_number").notNull(),
  title: text("title"),
  type: text("type").notNull(),
  config: jsonb("config"),
  sortOrder: integer("sort_order").default(0),
});

export const sessionsRelations = relations(sessions, ({ many }) => ({
  slides: many(slides),
}));

export const slidesRelations = relations(slides, ({ one, many }) => ({
  session: one(sessions, { fields: [slides.sessionId], references: [sessions.id] }),
}));

// ==================== 投票表 ====================

export const voteSessions = pgTable("vote_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slideId: uuid("slide_id").notNull().references(() => slides.id),
  title: text("title").notNull(),
  voteType: text("vote_type").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voteOptions = pgTable("vote_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  voteSessionId: uuid("vote_session_id").notNull().references(() => voteSessions.id),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  voteSessionId: uuid("vote_session_id").notNull().references(() => voteSessions.id),
  optionId: uuid("option_id").notNull().references(() => voteOptions.id),
  voterHash: text("voter_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== 学员键入表 ====================

export const inputs = pgTable("inputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slideId: uuid("slide_id").notNull().references(() => slides.id),
  inputType: text("input_type").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==================== 预埋：培训前后测量表 ====================

export const measurements = pgTable("measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull().references(() => sessions.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const measurementResponses = pgTable("measurement_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  measurementId: uuid("measurement_id").notNull().references(() => measurements.id),
  participantName: text("participant_name").notNull(),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
