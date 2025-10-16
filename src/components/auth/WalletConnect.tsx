"use client";

import { ConnectButton } from "thirdweb/react";
import { useTheme } from "next-themes";

import { client } from "@/lib/thirdweb/client";
import { activeChain } from "@/lib/thirdweb/chains";

export function WalletConnect() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";

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
