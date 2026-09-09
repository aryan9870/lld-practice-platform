import { Router } from "express";

import {
  createSubmissionController,
  getSubmissionByIdController,
  getSubmissionByAttemptIdController,
} from "../controllers/submission.controller.js";

const router = Router();

router.post("/", createSubmissionController);

router.get("/attempts/:attemptId", getSubmissionByAttemptIdController);

router.get("/:id", getSubmissionByIdController);

export default router;