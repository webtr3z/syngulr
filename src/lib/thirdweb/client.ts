import { createThirdwebClient } from "thirdweb";

import { clientEnv } from "@/lib/env";

export const client = createThirdwebClient({
  clientId: clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});
