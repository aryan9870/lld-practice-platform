import { Router } from "express";
import learnerRoutes from "./learner.routes.js";
import problemRoutes from "./problem.routes.js";

const router = Router();

router.use("/api/v1/learners", learnerRoutes);
router.use("/api/v1/problems", problemRoutes);

export default router;