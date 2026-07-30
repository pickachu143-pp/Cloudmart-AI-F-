import morgan from "morgan";
import { morganStream } from "../utils/logger";
import { env } from "../config/env";

/** HTTP access logging middleware (built on morgan), routed through winston. */
export const requestLogger = morgan(env.isProduction ? "combined" : "dev", {
  stream: morganStream,
});
