import type { Request, Response } from "express";
import { prisma } from "../db/db.js";

export const createSubmissionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { attemptId, format, content } = req.body;

    if (!attemptId || !format || !content) {
      return res.status(400).json({
        message: "attemptId, format and content are required",
      });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found",
      });
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "COMPLETED") {
      return res.status(400).json({
        message: "Attempt has already been submitted",
      });
    }

    const submission = await prisma.submission.create({
      data: {
        attemptId,
        format,
        content,
      },
    });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return res.status(201).json({
      message: "Submission created successfully",
      submission,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getSubmissionByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid submission id",
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      message: "Submission found",
      submission,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getSubmissionByAttemptIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { attemptId } = req.params;

    if (typeof attemptId !== "string") {
      return res.status(400).json({
        message: "Invalid attempt id",
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { attemptId },
    });

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found for this attempt",
      });
    }

    return res.status(200).json({
      message: "Submission found",
      submission,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};