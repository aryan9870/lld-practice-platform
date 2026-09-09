import { Router } from "express";
import {
  getAllProblemsController,
  getProblemByIdController,
} from "../controllers/problem.controller.js";

const router = Router();

router.get("/", getAllProblemsController);
router.get("/:id", getProblemByIdController);

export default router;