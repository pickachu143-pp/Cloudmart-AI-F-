import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { initCloudant } from "./services/cloudantService";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/requestLogger";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import apiRoutes from "./routes";

const app: Application = express();

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use("/api", apiRateLimiter);

// ---------- Routes ----------
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CloudMart AI API",
    version: "1.0.0",
    docs: "/api/health",
  });
});
app.use("/api", apiRoutes);

// ---------- 404 + error handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Bootstrap ----------
async function bootstrap() {
  try {
    await connectDatabase();
    await initCloudant();

    const server = app.listen(env.port, () => {
      logger.info(`CloudMart AI API listening on port ${env.port} [${env.nodeEnv}]`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info("Shutdown complete.");
        process.exit(0);
      });
      // Force-exit if graceful shutdown hangs.
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      logger.error(`Unhandled promise rejection: ${reason}`);
    });
    process.on("uncaughtException", (err) => {
      logger.error(`Uncaught exception: ${err.stack ?? err.message}`);
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${(err as Error).message}`);
    process.exit(1);
  }
}

bootstrap();

export default app;
