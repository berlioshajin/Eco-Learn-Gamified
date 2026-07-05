import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const topicEnum = pgEnum("topic", [
  "climate_change",
  "waste_management",
  "water_conservation",
  "energy_saving",
  "biodiversity",
]);

export const difficultyEnum = pgEnum("difficulty", ["beginner", "intermediate", "advanced"]);

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  topic: topicEnum("topic").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
