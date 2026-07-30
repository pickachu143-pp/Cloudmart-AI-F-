import axios from "axios";
import { watsonConfig } from "../config/watson";
import { logger } from "../utils/logger";
import { IProduct } from "../models/Product";

/**
 * AI Product Recommendation service, powered by IBM Watson Natural
 * Language Understanding.
 *
 * How it works:
 *  1. We build a short text profile from a user's recent activity
 *     (viewed / purchased product names + descriptions).
 *  2. Watson NLU extracts keywords & concepts from that profile.
 *  3. We score the product catalog against those keywords to produce
 *     a ranked recommendation list.
 *
 * If Watson credentials aren't configured (e.g. local dev without an
 * IBM Cloud account), the service transparently falls back to a
 * rule-based recommender (same-category + best-rated) so the feature
 * never breaks the app — it just gets smarter once Watson is wired up.
 */

interface WatsonKeyword {
  text: string;
  relevance: number;
}

async function extractKeywords(text: string): Promise<WatsonKeyword[]> {
  if (!watsonConfig.enabled) return [];

  try {
    const response = await axios.post(
      `${watsonConfig.url}/v1/analyze?version=${watsonConfig.version}`,
      {
        text,
        features: {
          keywords: { limit: 10 },
          concepts: { limit: 5 },
        },
      },
      {
        auth: { username: "apikey", password: watsonConfig.apiKey },
        headers: { "Content-Type": "application/json" },
        timeout: 8000,
      }
    );

    return (response.data?.keywords ?? []).map((k: any) => ({
      text: String(k.text).toLowerCase(),
      relevance: k.relevance ?? 0,
    }));
  } catch (err) {
    logger.warn(`Watson NLU request failed, falling back to rule-based recommendations: ${(err as Error).message}`);
    return [];
  }
}

/**
 * Ranks a product catalog against a user's activity profile.
 * Returns products sorted by relevance, most relevant first.
 */
export async function getRecommendations(
  activityText: string,
  catalog: IProduct[],
  limit = 8
): Promise<IProduct[]> {
  const keywords = await extractKeywords(activityText);

  if (keywords.length === 0) {
    // Fallback: highest rated, in-stock products first.
    return [...catalog]
      .filter((p) => p.stock > 0)
      .sort((a, b) => b.ratingAverage - a.ratingAverage || b.ratingCount - a.ratingCount)
      .slice(0, limit);
  }

  const scored = catalog
    .filter((p) => p.stock > 0)
    .map((product) => {
      const haystack = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (haystack.includes(kw.text)) score += kw.relevance;
      }
      // Light boost for well-rated products so recommendations aren't purely keyword-driven.
      score += product.ratingAverage * 0.05;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score);

  const topScored = scored.filter((s) => s.score > 0).map((s) => s.product);

  if (topScored.length >= limit) return topScored.slice(0, limit);

  // Pad out with top-rated items not already included, if keyword matches were sparse.
  const alreadyIncluded = new Set(topScored.map((p) => p._id.toString()));
  const padding = [...catalog]
    .filter((p) => p.stock > 0 && !alreadyIncluded.has(p._id.toString()))
    .sort((a, b) => b.ratingAverage - a.ratingAverage)
    .slice(0, limit - topScored.length);

  return [...topScored, ...padding];
}

/** Builds the free-text "profile" fed into Watson from raw activity data. */
export function buildActivityProfile(products: Pick<IProduct, "name" | "description" | "tags">[]): string {
  return products
    .map((p) => `${p.name}. ${p.description}. Tags: ${p.tags.join(", ")}.`)
    .join(" ")
    .slice(0, 4000); // Watson NLU has practical input limits; keep the payload reasonable.
}
