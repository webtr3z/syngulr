import { defineChain } from "thirdweb/chains";

import { clientEnv } from "@/lib/env";

export const activeChain = defineChain(clientEnv.NEXT_PUBLIC_CHAIN_ID);

export { ethereum, polygon, base } from "thirdweb/chains";
