import { Router } from "express";
import {
  createLearnerController,
  getLearnerByEmailController,
} from "../controllers/learner.controller.js";

const router = Router();

router.post("/", createLearnerController);

router.get("/email/:email", getLearnerByEmailController);

export default router;