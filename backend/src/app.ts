import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimit";
import { healthRouter } from "./routes/health";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(apiLimiter);

  app.use(healthRouter);
  app.use("/api", publicRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorHandler);
  return app;
}
