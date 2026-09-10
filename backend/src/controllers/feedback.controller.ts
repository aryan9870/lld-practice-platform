import type { Request, Response } from "express";
import { prisma } from "../db/db.js";

export const getFeedbackBySubmissionIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { submissionId } = req.params;

    if (typeof submissionId !== "string") {
      return res.status(400).json({ message: "Invalid submission id" });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { submissionId },
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback found", feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeedbackByAttemptIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { attemptId } = req.params;

    if (typeof attemptId !== "string") {
      return res.status(400).json({ message: "Invalid attempt id" });
    }

    const submission = await prisma.submission.findUnique({
      where: { attemptId },
    });

    if (!submission) {
      return res.status(404).json({ message: "No submission for this attempt" });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { submissionId: submission.id },
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback found", feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
