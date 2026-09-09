import type { Request, Response } from "express";
import { prisma } from "../db/db.js";

export const getAllProblemsController = async (req: Request, res: Response) => {
    try {
        const problems = await prisma.problem.findMany();
        res.status(200).json({ message: "Problems retrieved successfully", problems });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getProblemByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                message: "Invalid problem id",
            });
            return;
        }

        const problem = await prisma.problem.findUnique({
            where: { id },
        });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ message: "Problem retrieved successfully", problem });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
