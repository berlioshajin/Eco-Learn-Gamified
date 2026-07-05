import { Router } from "express";
import { db, lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { CreateLessonBody, UpdateLessonBody, ListLessonsQueryParams, GetLessonParams, UpdateLessonParams, DeleteLessonParams } from "@workspace/api-zod";

const router = Router();

// GET /lessons
router.get("/lessons", requireAuth, async (req, res) => {
  const query = ListLessonsQueryParams.safeParse(req.query);
  const topic = query.success && query.data.topic ? query.data.topic : undefined;

  const rows = topic
    ? await db.select().from(lessonsTable).where(eq(lessonsTable.topic, topic as any))
    : await db.select().from(lessonsTable).orderBy(lessonsTable.createdAt);

  res.json(rows.map(l => ({
    id: l.id,
    title: l.title,
    topic: l.topic,
    summary: l.summary,
    content: l.content,
    imageUrl: l.imageUrl,
    difficulty: l.difficulty,
    createdAt: l.createdAt,
  })));
});

// POST /lessons
router.post("/lessons", requireAdmin, async (req, res) => {
  const parse = CreateLessonBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }
  const { title, topic, summary, content, imageUrl, difficulty } = parse.data;
  const [lesson] = await db.insert(lessonsTable).values({
    title, topic: topic as any, summary, content, imageUrl, difficulty: difficulty as any,
  }).returning();
  res.status(201).json(lesson);
});

// GET /lessons/:id
router.get("/lessons/:id", requireAuth, async (req, res) => {
  const params = GetLessonParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, params.data.id));
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(lesson);
});

// PATCH /lessons/:id
router.patch("/lessons/:id", requireAdmin, async (req, res) => {
  const params = UpdateLessonParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = UpdateLessonBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const data = parse.data;
  const [lesson] = await db.update(lessonsTable)
    .set({ ...data, topic: data.topic as any, difficulty: data.difficulty as any })
    .where(eq(lessonsTable.id, params.data.id))
    .returning();
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(lesson);
});

// DELETE /lessons/:id
router.delete("/lessons/:id", requireAdmin, async (req, res) => {
  const params = DeleteLessonParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(lessonsTable).where(eq(lessonsTable.id, params.data.id));
  res.status(204).end();
});

export default router;
