import { env } from "./env";

/**
 * Configuration object consumed by services/watsonService.ts.
 * Kept separate from the service so credentials/config stay in one place
 * and the service itself is easy to unit test with mocked config.
 */
export const watsonConfig = {
  enabled: env.watson.enabled && !!env.watson.apiKey && !!env.watson.url,
  apiKey: env.watson.apiKey,
  url: env.watson.url,
  version: "2022-04-07",
};
