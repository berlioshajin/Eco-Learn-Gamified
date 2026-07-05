import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth } from "../middleware/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  const parse = RegisterBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error", details: parse.error.issues });
    return;
  }
  const { name, email, password, school, grade } = parse.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: "student",
    school: school || "",
    grade: grade ?? null,
  }).returning();

  const token = generateToken({ userId: user.id, role: user.role });
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ecoPoints: user.ecoPoints,
      school: user.school,
      grade: user.grade,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  });
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  const { email, password } = parse.data;

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken({ userId: user.id, role: user.role });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ecoPoints: user.ecoPoints,
      school: user.school,
      grade: user.grade,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    token,
  });
});

// POST /auth/logout
router.post("/auth/logout", (_req, res) => {
  res.json({ success: true });
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  const user = users[0];
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ecoPoints: user.ecoPoints,
    school: user.school,
    grade: user.grade,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

export default router;
