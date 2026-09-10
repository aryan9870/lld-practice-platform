import { Router } from "express";

import {
  createAttemptController,
  getAttemptByIdController,
  getAttemptsByLearnerIdController,
  getAttemptsByLearnerAndProblemController,
} from "../controllers/attempt.controller.js";

const router = Router();

router.post("/", createAttemptController);

router.get(
  "/learners/:learnerId/problems/:problemId",
  getAttemptsByLearnerAndProblemController
);

router.get(
  "/learners/:learnerId/attempts",
  getAttemptsByLearnerIdController
);

router.get("/:id", getAttemptByIdController);

export default router;