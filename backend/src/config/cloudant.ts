import { CloudantV1 } from "@ibm-cloud/cloudant";
import { IamAuthenticator } from "ibm-cloud-sdk-core";
import { env } from "./env";
import { logger } from "../utils/logger";

/**
 * IBM Cloudant client.
 *
 * Used two ways in CloudMart AI:
 *  1. As the PRIMARY database when DB_PROVIDER=cloudant (products, orders,
 *     users are stored as JSON documents instead of in MongoDB).
 *  2. Regardless of DB_PROVIDER, as the store for AI recommendation
 *     telemetry — every product view / purchase event is written here so
 *     Watson-driven recommendations have a growing dataset to reason over.
 */
let client: CloudantV1 | null = null;

export function getCloudantClient(): CloudantV1 {
  if (client) return client;

  if (!env.cloudant.apiKey || !env.cloudant.url) {
    throw new Error(
      "Cloudant is not configured. Set CLOUDANT_URL and CLOUDANT_APIKEY in your environment."
    );
  }

  const authenticator = new IamAuthenticator({ apikey: env.cloudant.apiKey });
  client = new CloudantV1({ authenticator });
  client.setServiceUrl(env.cloudant.url);
  return client;
}

/** Ensures the target database exists; safe to call repeatedly at startup. */
export async function ensureCloudantDatabase(dbName: string = env.cloudant.dbName): Promise<void> {
  try {
    const cloudant = getCloudantClient();
    await cloudant.getDatabaseInformation({ db: dbName });
    logger.info(`Cloudant database "${dbName}" is reachable.`);
  } catch (err: any) {
    if (err?.status === 404) {
      try {
        const cloudant = getCloudantClient();
        await cloudant.putDatabase({ db: dbName });
        logger.info(`Cloudant database "${dbName}" created.`);
      } catch (createErr) {
        logger.error(`Failed to create Cloudant database "${dbName}": ${(createErr as Error).message}`);
      }
    } else {
      logger.warn(`Cloudant not reachable at startup: ${(err as Error).message}. Continuing without it.`);
    }
  }
}
