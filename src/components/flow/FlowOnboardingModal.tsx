"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useActiveAccount } from "thirdweb/react";

import { Button } from "@/components/ui/button";

const SESSION_KEY_PREFIX = "syngulr-flow-onboarding";

export function FlowOnboardingModal() {
  const account = useActiveAccount();
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const sessionKey = useMemo(() => {
    const suffix = account?.address?.toLowerCase() ?? "anon";
    return `${SESSION_KEY_PREFIX}:${suffix}`;
  }, [account?.address]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = sessionStorage.getItem(sessionKey);
    if (!stored) {
      queueMicrotask(() => setIsOpen(true));
    }
  }, [sessionKey]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, new Date().toISOString());
    }
    setIsOpen(false);
  }, [sessionKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const focusTimeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimeout);
    };
  }, [handleDismiss, isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleDismiss}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="flow-onboarding-title"
        aria-describedby="flow-onboarding-description"
        className="relative z-10 w-full max-w-xl rounded-2xl border border-border/80 bg-card/95 p-8 shadow-xl"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Bienvenida
          </p>
          <div className="space-y-2">
            <h2
              id="flow-onboarding-title"
              className="text-3xl font-semibold tracking-tight text-foreground"
            >
              Conoce el lienzo de flujo
            </h2>
            <p
              id="flow-onboarding-description"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              Construye diagramas que tus agentes de IA pueden leer, ejecutar y escalar. Este canvas combina nodos, conexiones y metadatos para convertir ideas en instrucciones accionables.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <FeatureList
            title="¿Qué puedes hacer aquí?"
            items={[
              "Mapear procesos paso a paso usando nodos conectados.",
              "Definir entradas, salidas y responsables para cada etapa.",
              "Sincronizar el flujo con artefactos y contextos existentes.",
            ]}
          />
          <FeatureList
            title="Campos clave del lienzo"
            items={[
              "Lienzo editable: arrastra, conecta y reorganiza sin perder consistencia.",
              "Inspector contextual: edita títulos y descripciones con precisión.",
              "Mini mapa y auto layout para navegar diagramas extensos en segundos.",
            ]}
          />
        </div>

        <footer className="mt-10 space-y-4 rounded-xl border border-dashed border-border/70 bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            Este flujo fue diseñado para humanos, pero pensado en las máquinas: cada decisión queda descrita para que los modelos de IA la comprendan y colaboren contigo.
          </p>
        </footer>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            ref={closeButtonRef}
            variant="ghost"
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Recorrer después
          </Button>
          <Button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Empezar ahora
          </Button>
        </div>
      </section>
    </div>,
    document.body
  );
}

interface FeatureListProps {
  title: string;
  items: string[];
}

function FeatureList({ title, items }: FeatureListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-2 text-sm leading-relaxed text-foreground/90">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
