import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env";

export interface TokenPayload {
  id: string;
  role: "customer" | "admin";
}

/** Signs a JWT for the given user payload. */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as SignOptions);
}

/**
 * Signs a token and sets it as an httpOnly cookie, in addition to
 * returning it in the JSON body — clients can use either approach.
 */
export function issueTokenCookie(res: Response, payload: TokenPayload): string {
  const token = generateToken(payload);
  const expiresInMs = env.jwt.cookieExpiresDays * 24 * 60 * 60 * 1000;

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    expires: new Date(Date.now() + expiresInMs),
  });

  return token;
}
