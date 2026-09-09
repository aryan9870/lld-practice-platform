import { Router } from "express";
import {
  createLearnerController,
} from "../controllers/learner.controller.js";

const router = Router();

router.post("/", createLearnerController);

export default router;