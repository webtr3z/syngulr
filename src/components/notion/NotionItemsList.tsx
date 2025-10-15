"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { NotionFilter, NotionPage, NotionSort } from "@/types/notion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface NotionItemsListProps {
  databaseId: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  limit?: number;
  className?: string;
  showSearch?: boolean;
}

async function fetchNotionDatabase({
  databaseId,
  filter,
  sorts,
  limit,
  signal,
}: {
  databaseId: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  limit?: number;
  signal?: AbortSignal;
}) {
  const response = await fetch("/api/notion/database", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      databaseId,
      filter,
      sorts,
      limit,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Error al consultar Notion.");
  }

  const data = (await response.json()) as { items: NotionPage[] };
  return data.items ?? [];
}

export function NotionItemsList({
  databaseId,
  filter,
  sorts,
  limit,
  className,
  showSearch = true,
}: NotionItemsListProps) {
  const [items, setItems] = useState<NotionPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filterKey = useMemo(() => JSON.stringify(filter ?? null), [filter]);
  const sortsKey = useMemo(() => JSON.stringify(sorts ?? null), [sorts]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchNotionDatabase({
      databaseId,
      filter,
      sorts,
      limit,
      signal: controller.signal,
    })
      .then((fetched) => {
        setItems(fetched);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error fetching Notion items:", requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudieron cargar los artefactos."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [databaseId, filterKey, sortsKey, limit]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    const normalized = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.description,
        item.status,
        ...(item.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [items, searchTerm]);

  return (
    <section className={cn("space-y-4", className)}>
      {showSearch ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar artefactos..."
            className="max-w-sm"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div role="list" className="divide-y divide-border/60">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-md bg-muted/40" />
            <Skeleton className="h-16 w-full rounded-md bg-muted/40" />
            <Skeleton className="h-16 w-full rounded-md bg-muted/40" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No se encontraron elementos.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <article
              key={item.id}
              role="listitem"
              className="group relative flex items-start gap-3 py-4 transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
            >
              {item.icon ? (
                <span aria-hidden="true" className="mt-1 text-lg">
                  {item.icon}
                </span>
              ) : null}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm text-foreground">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      aria-label="Abrir en Notion"
                    >
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs"
                      >
                        Abrir
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {item.status ? (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal uppercase tracking-wide"
                    >
                      {item.status}
                    </Badge>
                  ) : null}
                  <MetaItem label="Creado" value={item.createdTime} />
                  <MetaItem label="Actualizado" value={item.lastEditedTime} />
                  {item.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[11px] font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const formatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
      }).format(new Date(value));
    } catch {
      return value;
    }
  }, [value]);

  return (
    <span>
      {label}: {formatted}
    </span>
  );
}
