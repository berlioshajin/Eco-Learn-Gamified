import { Router } from "express";
import { db, usersTable, lessonsTable, quizzesTable, challengesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /admin/dashboard
router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  const [{ totalStudents }] = await db.select({ totalStudents: sql<number>`cast(count(*) as int)` })
    .from(usersTable).where(eq(usersTable.role, "student"));
  const [{ totalLessons }] = await db.select({ totalLessons: sql<number>`cast(count(*) as int)` })
    .from(lessonsTable);
  const [{ totalQuizzes }] = await db.select({ totalQuizzes: sql<number>`cast(count(*) as int)` })
    .from(quizzesTable);
  const [{ totalChallenges }] = await db.select({ totalChallenges: sql<number>`cast(count(*) as int)` })
    .from(challengesTable);

  const recentRegistrations = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    ecoPoints: usersTable.ecoPoints,
    school: usersTable.school,
    grade: usersTable.grade,
    avatarUrl: usersTable.avatarUrl,
    createdAt: usersTable.createdAt,
  }).from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(desc(usersTable.createdAt))
    .limit(5);

  const topStudents = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    school: usersTable.school,
    ecoPoints: usersTable.ecoPoints,
    avatarUrl: usersTable.avatarUrl,
  }).from(usersTable)
    .where(eq(usersTable.role, "student"))
    .orderBy(sql`${usersTable.ecoPoints} desc`)
    .limit(5);

  res.json({
    totalStudents,
    totalLessons,
    totalQuizzes,
    totalChallenges,
    recentRegistrations,
    topStudents: topStudents.map((s, i) => ({
      rank: i + 1,
      studentId: s.id,
      name: s.name,
      school: s.school,
      ecoPoints: s.ecoPoints,
      badgeCount: 0,
      avatarUrl: s.avatarUrl ?? null,
    })),
  });
});

export default router;
