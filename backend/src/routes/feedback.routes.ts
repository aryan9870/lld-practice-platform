import { Router } from "express";

import {
  getFeedbackBySubmissionIdController,
  getFeedbackByAttemptIdController,
} from "../controllers/feedback.controller.js";

const router = Router();

router.get("/submission/:submissionId", getFeedbackBySubmissionIdController);

router.get("/attempt/:attemptId", getFeedbackByAttemptIdController);

export default router;
