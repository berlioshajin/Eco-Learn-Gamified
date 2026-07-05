import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import lessonsRouter from "./lessons";
import quizzesRouter from "./quizzes";
import challengesRouter from "./challenges";
import leaderboardRouter from "./leaderboard";
import badgesRouter from "./badges";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(lessonsRouter);
router.use(quizzesRouter);
router.use(challengesRouter);
router.use(leaderboardRouter);
router.use(badgesRouter);
router.use(adminRouter);

export default router;
