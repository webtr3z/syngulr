/**
 * Environment Variable Management
 *
 * This module provides type-safe, validated access to environment variables.
 * It ensures that required variables are present and never exposes secrets to the client.
 *
 * Usage:
 * - Import { env } from '@/lib/env' for server-side code
 * - Import { clientEnv } from '@/lib/env' for client-side code
 */

import { z } from "zod";

/**
 * Server-side environment variables schema
 * These variables are NEVER exposed to the browser
 */
const serverSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Thirdweb Server Secrets
  THIRDWEB_SECRET_KEY: z.string().min(1, "THIRDWEB_SECRET_KEY is required"),
  THIRDWEB_ADMIN_PRIVATE_KEY: z
    .string()
    .min(1, "THIRDWEB_ADMIN_PRIVATE_KEY is required"),

  // Notion API (Optional)
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),

  // Session & Security
  SESSION_SECRET: z.string().min(32).optional(),
  SESSION_MAX_AGE: z.coerce.number().default(604800), // 7 days in seconds

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

/**
 * Client-side environment variables schema
 * These variables are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
  // Thirdweb Public Config
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: z
    .string()
    .min(1, "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required"),
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().default(1),
  NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN: z
    .string()
    .min(1, "NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN is required"),

  // App Config
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
});

/**
 * Validates and returns server-side environment variables
 * @throws {Error} If validation fails
 */
function getServerEnv() {
  // Only run on server
  if (typeof window !== "undefined") {
    throw new Error(
      "Server environment variables cannot be accessed on the client"
    );
  }

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );

    // During build time or when explicitly skipped, allow missing vars
    if (process.env.SKIP_ENV_VALIDATION === "true") {
      console.warn(
        "⚠️  Skipping server env validation - ensure vars are set before deployment"
      );
      // Return empty object with defaults for build time
      return serverSchema.parse({
        NODE_ENV: process.env.NODE_ENV || "development",
        THIRDWEB_SECRET_KEY: "build-time-placeholder",
        THIRDWEB_ADMIN_PRIVATE_KEY:
          "0000000000000000000000000000000000000000000000000000000000000000",
      });
    }

    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

/**
 * Validates and returns client-side environment variables
 * @throws {Error} If validation fails
 */
function getClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );

    // During build time or when explicitly skipped, allow missing vars
    if (process.env.SKIP_ENV_VALIDATION === "true") {
      console.warn(
        "⚠️  Skipping client env validation - ensure vars are set before deployment"
      );
      // Return defaults for build time
      return clientSchema.parse({
        NEXT_PUBLIC_THIRDWEB_CLIENT_ID: "build-placeholder",
        NEXT_PUBLIC_NFT_CONTRACT_ADDRESS:
          "0x0000000000000000000000000000000000000000",
        NEXT_PUBLIC_CHAIN_ID: "1",
        NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN: "localhost:3000",
        NEXT_PUBLIC_APP_ENV: "development",
      });
    }

    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

/**
 * Server-side environment variables
 * Use this in API routes, server components, and server-side code
 *
 * @example
 * import { env } from '@/lib/env';
 * const secretKey = env.THIRDWEB_SECRET_KEY;
 */
export const env =
  typeof window === "undefined"
    ? getServerEnv()
    : ({} as z.infer<typeof serverSchema>);

/**
 * Client-side environment variables
 * Use this in client components and browser code
 *
 * @example
 * import { clientEnv } from '@/lib/env';
 * const clientId = clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
 */
export const clientEnv = getClientEnv();

/**
 * Type exports for convenience
 */
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Helper to check if we're in production
 */
export const isProd =
  typeof window === "undefined"
    ? env.NODE_ENV === "production"
    : clientEnv.NEXT_PUBLIC_APP_ENV === "production";

/**
 * Helper to check if we're in development
 */
export const isDev =
  typeof window === "undefined"
    ? env.NODE_ENV === "development"
    : clientEnv.NEXT_PUBLIC_APP_ENV === "development";
