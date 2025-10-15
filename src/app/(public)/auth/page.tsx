"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { balanceOf } from "thirdweb/extensions/erc721";
import { useActiveAccount, useReadContract } from "thirdweb/react";

import { WalletConnect } from "@/components/auth/WalletConnect";
import { nftContract } from "@/lib/thirdweb/contract";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const isAccountConnected = Boolean(account?.address);

  const { data: balance, isLoading } = useReadContract(balanceOf, {
    contract: nftContract,
    owner: account?.address ?? "0x0000000000000000000000000000000000000000",
    queryOptions: {
      enabled: isAccountConnected,
    },
  });

  const hasNFT = isAccountConnected && Boolean(balance && balance > 0n);

  useEffect(() => {
    if (isAccountConnected && !isLoading && hasNFT) {
      router.push("/flow");
    }
  }, [hasNFT, isAccountConnected, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md space-y-10 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Acceso a Syngulr
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Conecta tu wallet para acceder a la plataforma.
          </p>
        </div>

        {!isAccountConnected ? (
          <div className="space-y-5 rounded-xl border border-border bg-card/60 p-8 text-center shadow-sm backdrop-blur">
            <div className="flex justify-center">
              <WalletConnect />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Usa MetaMask, WalletConnect o cualquier wallet compatible.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-5 rounded-xl border border-border bg-card/60 p-8 text-center shadow-sm">
            <div aria-hidden="true" className="mx-auto loader-circle" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Verificando tu token de acceso...
            </p>
          </div>
        ) : !hasNFT ? (
          <div className="space-y-6 rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-destructive">
                Token de acceso requerido
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Necesitas un token de acceso para ingresar a Syngulr.
              </p>
            </div>
            <Button asChild className="w-full justify-center">
              <Link href="/claim">Obténlo aquí</Link>
            </Button>
            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex justify-center">
                <WalletConnect />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                ¿Conectaste la wallet incorrecta?
              </p>
            </div>
          </div>
        ) : null}

        <div className="text-xs leading-relaxed text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
