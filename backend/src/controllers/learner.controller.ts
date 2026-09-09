import { prisma } from "../db/db.js";
import type { Request, Response } from "express";


export const createLearnerController = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;

        const existingLearner = await prisma.learner.findUnique({
            where: {
                email,
            },
        });

        if (existingLearner) {
            return res.status(400).json({ message: "Learner with this email already exists" });
        }

        const learner = await prisma.learner.create({
            data: {
                name,
                email,
            },
        });

        res.status(201).json({ message: "Learner created successfully", learner });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

