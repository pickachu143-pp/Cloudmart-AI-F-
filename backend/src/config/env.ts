import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized, type-safe environment configuration.
 * Every other module reads config from here instead of `process.env`
 * directly, so defaults and validation live in exactly one place.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Fail fast and loud in production; allow local dev to limp along with warnings.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`[env] Warning: ${name} is not set. Using empty string.`);
    return "";
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT ?? "5000", 10),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",

  dbProvider: (process.env.DB_PROVIDER ?? "mongodb") as "mongodb" | "cloudant",
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/cloudmart-ai"),

  cloudant: {
    url: process.env.CLOUDANT_URL ?? "",
    apiKey: process.env.CLOUDANT_APIKEY ?? "",
    dbName: process.env.CLOUDANT_DB_NAME ?? "cloudmart_events",
  },

  jwt: {
    secret: required("JWT_SECRET", "dev_insecure_secret_change_me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    cookieExpiresDays: parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS ?? "7", 10),
  },

  watson: {
    apiKey: process.env.WATSON_NLU_APIKEY ?? "",
    url: process.env.WATSON_NLU_URL ?? "",
    enabled: (process.env.WATSON_ENABLED ?? "true") === "true",
  },

  logLevel: process.env.LOG_LEVEL ?? "info",

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? "300", 10),
  },
};
