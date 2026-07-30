import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

/**
 * Connects to the primary datastore.
 *
 * CloudMart AI supports two interchangeable providers:
 *  - "mongodb"  -> Mongoose ODM against MongoDB (default, used for all core
 *                  transactional data: users, products, orders, carts)
 *  - "cloudant" -> IBM Cloudant is always available as a secondary store
 *                  (see cloudant.ts) for AI telemetry & recommendation
 *                  events regardless of which provider is primary.
 */
export async function connectDatabase(): Promise<void> {
  if (env.dbProvider === "mongodb") {
    await connectMongo();
  } else {
    logger.info("DB_PROVIDER=cloudant — primary reads/writes will use IBM Cloudant.");
  }
}

async function connectMongo(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${maskUri(env.mongoUri)}`);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect is handled by the driver.");
    });
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${(err as Error).message}`);
    // In production we want the process manager / k8s to restart the pod.
    process.exit(1);
  }
}

function maskUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB connection closed.");
  }
}
