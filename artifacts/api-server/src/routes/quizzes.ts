import { Router } from "express";
import { db, quizzesTable, quizQuestionsTable, quizAttemptsTable, usersTable, badgesTable, userBadgesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import {
  CreateQuizBody, UpdateQuizBody, QuizInput as _QuizInput,
  AddQuizQuestionBody, UpdateQuizQuestionBody, SubmitQuizAttemptBody,
  ListQuizzesQueryParams, GetQuizParams, UpdateQuizParams, DeleteQuizParams,
  AddQuizQuestionParams, SubmitQuizAttemptParams, UpdateQuizQuestionParams, DeleteQuizQuestionParams,
} from "@workspace/api-zod";
import { checkAndAwardBadges } from "./challenges";

const router = Router();

// GET /quizzes
router.get("/quizzes", requireAuth, async (req, res) => {
  const query = ListQuizzesQueryParams.safeParse(req.query);
  const topic = query.success && query.data.topic ? query.data.topic : undefined;

  const quizzes = topic
    ? await db.select().from(quizzesTable).where(eq(quizzesTable.topic, topic as any))
    : await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);

  const questionCounts = await db.select({
    quizId: quizQuestionsTable.quizId,
    count: sql<number>`cast(count(*) as int)`,
  }).from(quizQuestionsTable).groupBy(quizQuestionsTable.quizId);
  const countMap = new Map(questionCounts.map(r => [r.quizId, r.count]));

  res.json(quizzes.map(q => ({
    id: q.id,
    title: q.title,
    topic: q.topic,
    description: q.description,
    pointsPerQuestion: q.pointsPerQuestion,
    questionCount: countMap.get(q.id) || 0,
    createdAt: q.createdAt,
  })));
});

// POST /quizzes
router.post("/quizzes", requireAdmin, async (req, res) => {
  const parse = CreateQuizBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }
  const { title, topic, description, pointsPerQuestion } = parse.data;
  const [quiz] = await db.insert(quizzesTable).values({
    title, topic: topic as any, description, pointsPerQuestion,
  }).returning();
  res.status(201).json({ ...quiz, questionCount: 0 });
});

// GET /quizzes/:id
router.get("/quizzes/:id", requireAuth, async (req, res) => {
  const params = GetQuizParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const questions = await db.select().from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id))
    .orderBy(quizQuestionsTable.order, quizQuestionsTable.id);

  res.json({ ...quiz, questions });
});

// PATCH /quizzes/:id
router.patch("/quizzes/:id", requireAdmin, async (req, res) => {
  const params = UpdateQuizParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = UpdateQuizBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const data = parse.data;
  const [quiz] = await db.update(quizzesTable)
    .set({ ...data, topic: data.topic as any })
    .where(eq(quizzesTable.id, params.data.id))
    .returning();
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  res.json(quiz);
});

// DELETE /quizzes/:id
router.delete("/quizzes/:id", requireAdmin, async (req, res) => {
  const params = DeleteQuizParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  res.status(204).end();
});

// POST /quizzes/:id/questions
router.post("/quizzes/:id/questions", requireAdmin, async (req, res) => {
  const params = AddQuizQuestionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = AddQuizQuestionBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }
  const { questionText, options, correctOption, explanation, order } = parse.data;
  const [question] = await db.insert(quizQuestionsTable).values({
    quizId: params.data.id,
    questionText,
    options,
    correctOption,
    explanation: explanation ?? null,
    order: order ?? 0,
  }).returning();
  res.status(201).json(question);
});

// POST /quizzes/:id/attempt
router.post("/quizzes/:id/attempt", requireAuth, async (req, res) => {
  const params = SubmitQuizAttemptParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = SubmitQuizAttemptBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }

  const quizId = params.data.id;
  const userId = req.user!.id;
  const { answers } = parse.data;

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }

  const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quizId));
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Deduplicate answers by questionId (keep last) and reject unknown questions
  const seenQuestionIds = new Set<number>();
  const validAnswers = answers.filter(a => {
    if (!questionMap.has(a.questionId)) return false;
    if (seenQuestionIds.has(a.questionId)) return false;
    seenQuestionIds.add(a.questionId);
    return true;
  });

  let correct = 0;
  const feedback = validAnswers.map(a => {
    const q = questionMap.get(a.questionId)!;
    const isCorrect = q.correctOption === a.selectedOption;
    if (isCorrect) correct++;
    return {
      questionId: a.questionId,
      correct: isCorrect,
      correctOption: q.correctOption,
      explanation: q.explanation ?? null,
    };
  });

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const pointsEarned = correct * quiz.pointsPerQuestion;

  const [attempt] = await db.insert(quizAttemptsTable).values({
    studentId: userId,
    quizId,
    answers,
    score,
    pointsEarned,
  }).returning();

  // Award points
  const [updatedUser] = await db.update(usersTable)
    .set({ ecoPoints: sql`${usersTable.ecoPoints} + ${pointsEarned}` })
    .where(eq(usersTable.id, userId))
    .returning();

  // Check for new badges
  const newBadges = await checkAndAwardBadges(userId, updatedUser.ecoPoints);

  res.json({
    attemptId: attempt.id,
    score,
    totalQuestions: questions.length,
    correctAnswers: correct,
    pointsEarned,
    newBadges,
    feedback,
  });
});

// PATCH /questions/:id
router.patch("/questions/:id", requireAdmin, async (req, res) => {
  const params = UpdateQuizQuestionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = UpdateQuizQuestionBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const [question] = await db.update(quizQuestionsTable)
    .set(parse.data)
    .where(eq(quizQuestionsTable.id, params.data.id))
    .returning();
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(question);
});

// DELETE /questions/:id
router.delete("/questions/:id", requireAdmin, async (req, res) => {
  const params = DeleteQuizQuestionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.id, params.data.id));
  res.status(204).end();
});

// GET /quiz-attempts
router.get("/quiz-attempts", requireAuth, async (req, res) => {
  const attempts = await db.select({
    id: quizAttemptsTable.id,
    quizId: quizAttemptsTable.quizId,
    quizTitle: quizzesTable.title,
    topic: quizzesTable.topic,
    score: quizAttemptsTable.score,
    pointsEarned: quizAttemptsTable.pointsEarned,
    createdAt: quizAttemptsTable.createdAt,
  })
    .from(quizAttemptsTable)
    .innerJoin(quizzesTable, eq(quizAttemptsTable.quizId, quizzesTable.id))
    .where(eq(quizAttemptsTable.studentId, req.user!.id))
    .orderBy(sql`${quizAttemptsTable.createdAt} desc`);
  res.json(attempts);
});

export default router;
