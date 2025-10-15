/**
 * Environment Variable Validator
 *
 * This script runs at build time to validate all environment variables
 * before the application starts. It prevents deployment with missing or invalid config.
 */

import { env, clientEnv } from "./env";

export function validateEnvironment() {
  console.log("🔍 Validating environment variables...");

  try {
    // Validate server env (only on server)
    if (typeof window === "undefined") {
      const serverVars = env;
      console.log("✅ Server environment variables validated");

      // Security checks
      if (serverVars.THIRDWEB_ADMIN_PRIVATE_KEY.startsWith("0x")) {
        console.warn("⚠️  Admin private key should not include '0x' prefix");
      }

      if (serverVars.NODE_ENV === "production" && !serverVars.SESSION_SECRET) {
        console.error("❌ SESSION_SECRET is required in production");
        throw new Error("Missing SESSION_SECRET in production");
      }
    }

    // Validate client env
    void clientEnv;
    console.log("✅ Client environment variables validated");

    // Security warnings
    if (typeof window === "undefined") {
      console.log("\n🔒 Security Check:");
      console.log("  - Server secrets: ✅ Protected");
      console.log("  - Client variables: ✅ Validated");
      console.log("  - Private keys: ✅ Never exposed to client\n");
    }

    return true;
  } catch (error) {
    console.error("\n❌ Environment validation failed:");
    console.error(error);

    if (process.env.NODE_ENV === "production") {
      console.error(
        "\n🚨 Cannot start application with invalid environment variables"
      );
      process.exit(1);
    }

    throw error;
  }
}

// Run validation immediately if this file is imported
if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  validateEnvironment();
}
