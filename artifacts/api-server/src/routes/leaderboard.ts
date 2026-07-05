import { Router } from "express";
import { db, usersTable, userBadgesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// GET /leaderboard
router.get("/leaderboard", optionalAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const students = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    school: usersTable.school,
    ecoPoints: usersTable.ecoPoints,
    avatarUrl: usersTable.avatarUrl,
  })
    .from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(sql`${usersTable.ecoPoints} desc`)
    .limit(limit);

  const badgeCounts = await db.select({
    userId: userBadgesTable.userId,
    count: sql<number>`cast(count(*) as int)`,
  }).from(userBadgesTable).groupBy(userBadgesTable.userId);
  const badgeMap = new Map(badgeCounts.map(r => [r.userId, r.count]));

  res.json(students.map((s, i) => ({
    rank: i + 1,
    studentId: s.id,
    name: s.name,
    school: s.school,
    ecoPoints: s.ecoPoints,
    badgeCount: badgeMap.get(s.id) || 0,
    avatarUrl: s.avatarUrl ?? null,
  })));
});

export default router;
