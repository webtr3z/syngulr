import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Obtén tu token de acceso | Syngulr",
  description: "Consigue tu token de acceso NFT para usar Syngulr.",
};

export default function ClaimPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Obtén tu token de acceso
          </h1>
          <p className="text-xl text-muted-foreground">
            El token NFT de Syngulr te da acceso completo a la plataforma.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 text-left shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">Próximamente</h2>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Estamos preparando el sistema de distribución de tokens de acceso.
            </p>
            <p>Pronto podrás:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Reclamar tu token NFT de acceso</li>
              <li>Ver los beneficios de cada nivel</li>
              <li>Gestionar tus tokens</li>
              <li>Acceder a funciones exclusivas</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/auth">Conectar wallet</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          ¿Ya tienes un token? Intenta{" "}
          <Link href="/auth" className="text-primary hover:underline">
            conectar tu wallet
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
