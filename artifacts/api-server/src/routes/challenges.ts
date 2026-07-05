import { Router } from "express";
import { db, challengesTable, challengeCompletionsTable, usersTable, badgesTable, userBadgesTable } from "@workspace/db";
import { eq, and, sql, gte } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { CreateChallengeBody, UpdateChallengeBody, UpdateChallengeParams, DeleteChallengeParams, CompleteChallengeParams } from "@workspace/api-zod";

const router = Router();

// GET /challenges
router.get("/challenges", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const allChallenges = await db.select().from(challengesTable).orderBy(challengesTable.createdAt);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const completedToday = await db.select({ challengeId: challengeCompletionsTable.challengeId })
    .from(challengeCompletionsTable)
    .where(and(
      eq(challengeCompletionsTable.studentId, userId),
      gte(challengeCompletionsTable.completedAt, todayStart),
    ));
  const completedTodayIds = new Set(completedToday.map(c => c.challengeId));

  const totalCounts = await db.select({
    challengeId: challengeCompletionsTable.challengeId,
    count: sql<number>`cast(count(*) as int)`,
  }).from(challengeCompletionsTable).groupBy(challengeCompletionsTable.challengeId);
  const countMap = new Map(totalCounts.map(r => [r.challengeId, r.count]));

  res.json(allChallenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    icon: c.icon,
    ecoPoints: c.ecoPoints,
    isDaily: c.isDaily,
    completedToday: completedTodayIds.has(c.id),
    totalCompletions: countMap.get(c.id) || 0,
    createdAt: c.createdAt,
  })));
});

// POST /challenges
router.post("/challenges", requireAdmin, async (req, res) => {
  const parse = CreateChallengeBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }
  const [challenge] = await db.insert(challengesTable).values(parse.data).returning();
  res.status(201).json(challenge);
});

// PATCH /challenges/:id
router.patch("/challenges/:id", requireAdmin, async (req, res) => {
  const params = UpdateChallengeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parse = UpdateChallengeBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const [challenge] = await db.update(challengesTable)
    .set(parse.data)
    .where(eq(challengesTable.id, params.data.id))
    .returning();
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  res.json(challenge);
});

// DELETE /challenges/:id
router.delete("/challenges/:id", requireAdmin, async (req, res) => {
  const params = DeleteChallengeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(challengesTable).where(eq(challengesTable.id, params.data.id));
  res.status(204).end();
});

// POST /challenges/:id/complete
router.post("/challenges/:id/complete", requireAuth, async (req, res) => {
  const params = CompleteChallengeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const userId = req.user!.id;
  const challengeId = params.data.id;

  const [challenge] = await db.select().from(challengesTable).where(eq(challengesTable.id, challengeId));
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  // Check already completed today (for daily challenges)
  if (challenge.isDaily) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existing = await db.select().from(challengeCompletionsTable)
      .where(and(
        eq(challengeCompletionsTable.studentId, userId),
        eq(challengeCompletionsTable.challengeId, challengeId),
        gte(challengeCompletionsTable.completedAt, todayStart),
      )).limit(1);
    if (existing.length) {
      res.status(400).json({ error: "Challenge already completed today" });
      return;
    }
  }

  // Record completion
  const [completion] = await db.insert(challengeCompletionsTable)
    .values({ studentId: userId, challengeId })
    .returning();

  // Award points
  const [updatedUser] = await db.update(usersTable)
    .set({ ecoPoints: sql`${usersTable.ecoPoints} + ${challenge.ecoPoints}` })
    .where(eq(usersTable.id, userId))
    .returning();

  // Check for new badges
  const newBadges = await checkAndAwardBadges(userId, updatedUser.ecoPoints);

  res.json({
    id: completion.id,
    challengeId,
    pointsAwarded: challenge.ecoPoints,
    totalPoints: updatedUser.ecoPoints,
    newBadges,
  });
});

async function checkAndAwardBadges(userId: number, totalPoints: number) {
  const allBadges = await db.select().from(badgesTable).orderBy(badgesTable.pointsRequired);
  const earned = await db.select({ badgeId: userBadgesTable.badgeId })
    .from(userBadgesTable).where(eq(userBadgesTable.userId, userId));
  const earnedIds = new Set(earned.map(e => e.badgeId));

  const newBadges = [];
  for (const badge of allBadges) {
    if (!earnedIds.has(badge.id) && totalPoints >= badge.pointsRequired) {
      await db.insert(userBadgesTable).values({ userId, badgeId: badge.id });
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        pointsRequired: badge.pointsRequired,
        earnedAt: new Date().toISOString(),
      });
    }
  }
  return newBadges;
}

export { checkAndAwardBadges };
export default router;
