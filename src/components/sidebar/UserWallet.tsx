"use client";

import { useActiveAccount } from "thirdweb/react";

import { WalletConnect } from "@/components/auth/WalletConnect";
import { cn } from "@/lib/utils";

interface UserWalletProps {
  collapsed?: boolean;
}

export function UserWallet({ collapsed = false }: UserWalletProps) {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div
        className={cn(
          "border-t border-border p-4",
          collapsed && "flex flex-col items-center gap-3 px-2"
        )}
      >
        <WalletConnect />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-t border-border p-4",
        collapsed ? "px-2 text-center" : "space-y-2"
      )}
    >
      <p className="text-xs text-muted-foreground">Wallet conectada</p>
      {/* <p className="font-mono text-sm font-medium">
        {maskAddress(account.address)}
      </p> */}
      <div className={collapsed ? "mt-3" : "pt-2"}>
        <WalletConnect />
      </div>
    </div>
  );
}
