import { getContract } from "thirdweb";

import { client } from "./client";
import { activeChain } from "./chains";
import { clientEnv } from "@/lib/env";

export const nftContract = getContract({
  client,
  chain: activeChain,
  address: clientEnv.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
});
