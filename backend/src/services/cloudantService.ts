import { getCloudantClient, ensureCloudantDatabase } from "../config/cloudant";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { v4 as uuid } from "uuid";

/**
 * Lightweight event-logging service backed by IBM Cloudant.
 *
 * CloudMart AI writes a document here every time a user views or
 * purchases a product. This gives the AI recommendation engine (and any
 * future analytics dashboard) a durable, queryable activity trail that's
 * independent of the primary transactional database.
 *
 * Failures here are always logged and swallowed — analytics must never
 * take down a checkout or a page view.
 */

export type CloudmartEventType = "product_view" | "product_purchase" | "search";

export interface CloudmartEvent {
  _id?: string;
  type: CloudmartEventType;
  userId: string;
  productId?: string;
  query?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

let initialized = false;

export async function initCloudant(): Promise<void> {
  if (!env.cloudant.apiKey || !env.cloudant.url) {
    logger.info("Cloudant not configured — AI event logging will be a no-op. Set CLOUDANT_URL/CLOUDANT_APIKEY to enable.");
    return;
  }
  await ensureCloudantDatabase();
  initialized = true;
}

export async function logEvent(event: Omit<CloudmartEvent, "timestamp" | "_id">): Promise<void> {
  if (!initialized) return;

  try {
    const cloudant = getCloudantClient();
    const doc: CloudmartEvent = { ...event, _id: uuid(), timestamp: new Date().toISOString() };
    await cloudant.postDocument({ db: env.cloudant.dbName, document: doc });
  } catch (err) {
    logger.warn(`Failed to log event to Cloudant: ${(err as Error).message}`);
  }
}

/** Fetches recent activity for a user, used to build the Watson recommendation profile. */
export async function getRecentUserEvents(userId: string, limit = 20): Promise<CloudmartEvent[]> {
  if (!initialized) return [];

  try {
    const cloudant = getCloudantClient();
    const result = await cloudant.postFind({
      db: env.cloudant.dbName,
      selector: { userId },
      sort: [{ timestamp: "desc" } as any],
      limit,
    });
    return (result.result.docs as unknown as CloudmartEvent[]) ?? [];
  } catch (err) {
    logger.warn(`Failed to read events from Cloudant: ${(err as Error).message}`);
    return [];
  }
}
