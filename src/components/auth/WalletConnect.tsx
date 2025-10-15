"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "thirdweb/react";
import { useTheme } from "next-themes";

import { client } from "@/lib/thirdweb/client";
import { activeChain } from "@/lib/thirdweb/chains";

export function WalletConnect() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";

  return (
    <ConnectButton
      chain={activeChain}
      client={client}
      connectButton={{
        label: "Conectar Wallet",
      }}
      connectModal={{
        title: "Conecta tu wallet",
        titleIcon: "",
        showThirdwebBranding: false,
      }}
      theme={theme}
    />
  );
}
