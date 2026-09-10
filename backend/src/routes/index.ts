import { Router } from "express";
import learnerRoutes from "./learner.routes.js";
import problemRoutes from "./problem.routes.js";
import attemptRoutes from "./attempt.routes.js";
import submissionRoutes from "./submission.routes.js";
import feedbackRoutes from "./feedback.routes.js";

const router = Router();

router.use("/api/v1/learners", learnerRoutes);
router.use("/api/v1/problems", problemRoutes);
router.use("/api/v1/attempts", attemptRoutes);
router.use("/api/v1/submissions", submissionRoutes);
router.use("/api/v1/feedback", feedbackRoutes);

export default router;