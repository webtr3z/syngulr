/**
 * Health Check Endpoint
 *
 * This endpoint verifies that:
 * 1. The server is running
 * 2. Environment variables are properly configured
 * 3. No secrets are exposed
 *
 * Access: GET /api/health
 */

import { NextResponse } from "next/server";
import { clientEnv } from "@/lib/env";
import { ensureNoSecrets } from "@/lib/security/sanitize";

export async function GET() {
  try {
    // Public configuration that's safe to expose
    const publicConfig = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: clientEnv.NEXT_PUBLIC_APP_ENV,
      chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
      hasNFTContract: !!clientEnv.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
      hasThirdwebConfig: !!clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
    };

    // Double-check that we're not exposing any secrets
    ensureNoSecrets(publicConfig);

    return NextResponse.json(publicConfig);
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Configuration error",
      },
      { status: 500 }
    );
  }
}
