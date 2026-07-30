import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack ?? message}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Application-wide structured logger.
 * - Human-readable, colorized output in development.
 * - JSON output in production, ready to be shipped to a log aggregator
 *   (IBM Log Analysis, ELK, CloudWatch, etc.) from stdout.
 */
export const logger = winston.createLogger({
  level: env.logLevel,
  format: env.isProduction ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

/** Stream adapter so morgan's HTTP access logs flow through winston too. */
export const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
