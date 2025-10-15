"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { balanceOf } from "thirdweb/extensions/erc721";

import { nftContract } from "@/lib/thirdweb/contract";

interface TokenGateProps {
  children: ReactNode;
  redirectTo?: string;
}

export function TokenGate({ children, redirectTo = "/auth" }: TokenGateProps) {
  const account = useActiveAccount();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const isAccountConnected = Boolean(account?.address);

  const { data: balance, isLoading } = useReadContract(balanceOf, {
    contract: nftContract,
    owner: account?.address ?? "0x0000000000000000000000000000000000000000",
    queryOptions: {
      enabled: isAccountConnected,
    },
  });

  useEffect(() => {
    if (!isAccountConnected) {
      setIsChecking(true);
      router.replace(redirectTo);
      return;
    }

    if (isLoading) {
      setIsChecking(true);
      return;
    }

    if (!balance || balance === 0n) {
      setIsChecking(true);
      router.replace(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [balance, isAccountConnected, isLoading, redirectTo, router]);

  if (!isAccountConnected || isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div aria-hidden="true" className="loader-circle" />
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
