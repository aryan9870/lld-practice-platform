import { prisma } from "../db/db.js";
import type { Request, Response } from "express";
import { randomBytes, scryptSync } from "node:crypto";

const hashPassword = (password: string): string => {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
};

const toSafeLearner = (learner: { password: string; [key: string]: unknown }) => {
    const { password: _password, ...safe } = learner;
    return safe;
};

export const createLearnerController = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required" });
        }

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
                password: hashPassword(password),
            },
        });

        res.status(201).json({ message: "Learner created successfully", learner: toSafeLearner(learner) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getLearnerByEmailController = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;

        if (typeof email !== "string" || !email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const learner = await prisma.learner.findUnique({
            where: { email },
        });

        if (!learner) {
            return res.status(404).json({ message: "Learner not found" });
        }

        res.status(200).json({ message: "Learner found", learner: toSafeLearner(learner) });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
