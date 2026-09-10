import type { Request, Response } from "express";
import { prisma } from "../db/db.js";

export const createAttemptController = async (req: Request, res: Response) => {
    try {
        const { learnerId, problemId } = req.body;
        const attempt = await prisma.attempt.create({
            data: {
                learnerId,
                problemId
            }
        });
        res.status(201).json({ message: "Attempt created successfully", attempt });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getAttemptByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                message: "Invalid attempt id",
            });
            return;
        }
        
        const attempt = await prisma.attempt.findUnique({
            where: {
                id,
            },
            include: {
                problem: true,
                learner: true,
                submission: true,
            },
        });

        if (!attempt) {
            res.status(404).json({
                message: "Attempt not found",
            });
            return;
        }
        
        res.json({ message: "Attempt found", attempt });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getAttemptsByLearnerIdController = async (req: Request, res: Response) => {
    try {
        const { learnerId } = req.params;

        if (typeof learnerId !== "string") {
            res.status(400).json({
                message: "Invalid learner id",
            });
            return;
        }
        
        const attempts = await prisma.attempt.findMany({
            where: { learnerId }
        });
        res.json({ message: "Attempts found", attempts });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};