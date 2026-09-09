import { Router } from "express";
import learnerRoutes from "./learner.routes.js";

const router = Router();

router.use("/api/v1/learner", learnerRoutes);

export default router;