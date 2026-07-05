import { Router } from "express";
import { db, badgesTable, userBadgesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /badges
router.get("/badges", requireAuth, async (req, res) => {
  const badges = await db.select().from(badgesTable).orderBy(badgesTable.pointsRequired);
  res.json(badges.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    pointsRequired: b.pointsRequired,
    earnedAt: null,
  })));
});

// GET /badges/mine
router.get("/badges/mine", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const earned = await db.select({
    id: badgesTable.id,
    name: badgesTable.name,
    description: badgesTable.description,
    icon: badgesTable.icon,
    pointsRequired: badgesTable.pointsRequired,
    earnedAt: userBadgesTable.earnedAt,
  })
    .from(userBadgesTable)
    .innerJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
    .where(eq(userBadgesTable.userId, userId))
    .orderBy(badgesTable.pointsRequired);

  res.json(earned.map(b => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    pointsRequired: b.pointsRequired,
    earnedAt: b.earnedAt?.toISOString() ?? null,
  })));
});

export default router;
