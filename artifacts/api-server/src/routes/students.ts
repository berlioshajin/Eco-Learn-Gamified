import { Router } from "express";
import { db, usersTable, quizAttemptsTable, challengeCompletionsTable, badgesTable, userBadgesTable, quizzesTable, lessonsTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { UpdateStudentBody, UpdateStudentParams, GetStudentParams } from "@workspace/api-zod";

const router = Router();

// GET /dashboard
router.get("/dashboard", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Rank among students
  const rankedStudents = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(sql`${usersTable.ecoPoints} desc`);
  const rank = rankedStudents.findIndex(s => s.id === userId) + 1;

  // Quiz attempts count
  const [{ quizCount }] = await db.select({ quizCount: sql<number>`cast(count(*) as int)` })
    .from(quizAttemptsTable).where(eq(quizAttemptsTable.studentId, userId));

  // Challenge completions count
  const [{ challengeCount }] = await db.select({ challengeCount: sql<number>`cast(count(*) as int)` })
    .from(challengeCompletionsTable).where(eq(challengeCompletionsTable.studentId, userId));

  // Badges
  const earnedBadges = await db.select().from(userBadgesTable).where(eq(userBadgesTable.userId, userId));

  // Recent activity (last 10)
  const recentAttempts = await db.select({
    id: quizAttemptsTable.id,
    pointsEarned: quizAttemptsTable.pointsEarned,
    createdAt: quizAttemptsTable.createdAt,
  }).from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.studentId, userId))
    .orderBy(desc(quizAttemptsTable.createdAt))
    .limit(5);

  const recentChallenges = await db.select({
    id: challengeCompletionsTable.id,
    challengeId: challengeCompletionsTable.challengeId,
    completedAt: challengeCompletionsTable.completedAt,
  }).from(challengeCompletionsTable)
    .where(eq(challengeCompletionsTable.studentId, userId))
    .orderBy(desc(challengeCompletionsTable.completedAt))
    .limit(5);

  const recentActivity = [
    ...recentAttempts.map(a => ({
      id: a.id,
      type: "quiz" as const,
      description: `Completed a quiz`,
      points: a.pointsEarned,
      createdAt: a.createdAt.toISOString(),
    })),
    ...recentChallenges.map(c => ({
      id: c.id,
      type: "challenge" as const,
      description: `Completed an eco challenge`,
      points: 0,
      createdAt: c.completedAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  // Topic progress
  const topics = ["climate_change", "waste_management", "water_conservation", "energy_saving", "biodiversity"] as const;

  const topicProgress = await Promise.all(topics.map(async (topic) => {
    const [{ lessonCount }] = await db.select({ lessonCount: sql<number>`cast(count(*) as int)` })
      .from(lessonsTable).where(eq(lessonsTable.topic, topic));
    const [{ totalQuizzes }] = await db.select({ totalQuizzes: sql<number>`cast(count(*) as int)` })
      .from(quizzesTable).where(eq(quizzesTable.topic, topic));
    // Count distinct quizzes (for this topic) the student has attempted
    const topicQuizIds = await db.select({ id: quizzesTable.id }).from(quizzesTable).where(eq(quizzesTable.topic, topic));
    let completedQuizzes = 0;
    if (topicQuizIds.length > 0) {
      const ids = topicQuizIds.map(q => q.id);
      const [{ count }] = await db.select({ count: sql<number>`cast(count(distinct ${quizAttemptsTable.quizId}) as int)` })
        .from(quizAttemptsTable)
        .where(and(
          eq(quizAttemptsTable.studentId, userId),
          sql`${quizAttemptsTable.quizId} = ANY(ARRAY[${sql.raw(ids.join(","))}]::int[])`,
        ));
      completedQuizzes = count;
    }
    return {
      topic,
      totalLessons: lessonCount,
      completedQuizzes,
      totalQuizzes,
    };
  }));

  res.json({
    ecoPoints: user.ecoPoints,
    rank,
    completedQuizzes: quizCount,
    completedChallenges: challengeCount,
    earnedBadges: earnedBadges.length,
    recentActivity,
    topicProgress,
  });
});

// GET /students
router.get("/students", requireAdmin, async (req, res) => {
  const students = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    ecoPoints: usersTable.ecoPoints,
    school: usersTable.school,
    grade: usersTable.grade,
    avatarUrl: usersTable.avatarUrl,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.role, "student")).orderBy(desc(usersTable.createdAt));
  res.json(students);
});

// GET /students/:id
router.get("/students/:id", requireAuth, async (req, res) => {
  const params = GetStudentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const earnedBadges = await db.select({
    id: badgesTable.id,
    name: badgesTable.name,
    description: badgesTable.description,
    icon: badgesTable.icon,
    pointsRequired: badgesTable.pointsRequired,
    earnedAt: userBadgesTable.earnedAt,
  })
    .from(userBadgesTable)
    .innerJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
    .where(eq(userBadgesTable.userId, user.id));

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    ecoPoints: user.ecoPoints,
    school: user.school,
    grade: user.grade,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    badges: earnedBadges.map(b => ({ ...b, earnedAt: b.earnedAt?.toISOString() ?? null })),
    recentActivity: [],
  });
});

// PATCH /students/:id
router.patch("/students/:id", requireAuth, async (req, res) => {
  const params = UpdateStudentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  if (req.user!.role !== "admin" && req.user!.id !== params.data.id) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }
  const parse = UpdateStudentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const [updated] = await db.update(usersTable)
    .set(parse.data)
    .where(eq(usersTable.id, params.data.id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      ecoPoints: usersTable.ecoPoints,
      school: usersTable.school,
      grade: usersTable.grade,
      avatarUrl: usersTable.avatarUrl,
      createdAt: usersTable.createdAt,
    });
  res.json(updated);
});

export default router;
