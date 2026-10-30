import { Router } from "express";
import { prisma } from "../lib/prisma";
import { cloudinaryConfigured } from "../config";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      db: "ok",
      cloudinary: cloudinaryConfigured() ? "ok" : "missing",
    });
  } catch {
    res.status(503).json({ status: "degraded", db: "error" });
  }
});
