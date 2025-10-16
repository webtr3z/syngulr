"use client";

import { useActiveAccount } from "thirdweb/react";

import { WalletConnect } from "@/components/auth/WalletConnect";

export function UserWallet() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="flex items-center gap-3">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
        <p className="text-sm font-medium text-muted-foreground">
          Wallet conectada
        </p>
      </div>
      <WalletConnect />
    </div>
  );
}
