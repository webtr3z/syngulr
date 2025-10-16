"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { NotionFilter, NotionPage, NotionSort } from "@/types/notion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NotionPromptModal } from "@/components/notion/NotionPromptModal";

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

async function fetchNotionMarkdown({
  pageId,
  signal,
}: {
  pageId: string;
  signal?: AbortSignal;
}) {
  const response = await fetch("/api/notion/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pageId }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "No se pudo cargar el contenido.");
  }

  const data = (await response.json()) as { markdown: string };
  return data.markdown;
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
  const [selectedItem, setSelectedItem] = useState<NotionPage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("Sin contenido");

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

  const handleOpenModal = useCallback(async (item: NotionPage) => {
    setSelectedItem(item);
    setModalContent("Cargando contenido...");
    setModalOpen(true);
    try {
      const markdown = await fetchNotionMarkdown({ pageId: item.id });
      setModalContent(markdown.trim() || "Sin contenido");
    } catch (requestError) {
      console.error("Error fetching Notion page:", requestError);
      setModalContent("No se pudo cargar el contenido.");
      toast.error("No se pudo cargar el contenido desde Notion");
    }
  }, []);

  const handleCloseModal = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedItem(null);
      setModalContent("Sin contenido");
    }
  }, []);

  return (
    <section className={cn("space-y-6", className)}>
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

      <div role="list" className="flex flex-col gap-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[132px] w-full rounded-2xl bg-muted/40" />
            <Skeleton className="h-[132px] w-full rounded-2xl bg-muted/40" />
            <Skeleton className="h-[132px] w-full rounded-2xl bg-muted/40" />
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
              className="group relative flex w-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary/50 focus-within:shadow-md sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-1 items-start gap-3">
                  {item.icon ? (
                    <span
                      aria-hidden="true"
                      className="mt-1 text-xl transition-transform duration-200 group-hover:scale-110"
                    >
                      {item.icon}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="mt-1 h-8 w-8 rounded-full bg-muted/60"
                    />
                  )}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="rounded-full px-4 text-xs font-medium transition-transform duration-200 hover:-translate-y-0.5"
                    aria-label="Abrir artefacto"
                    onClick={() => handleOpenModal(item)}
                  >
                    Abrir
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.status ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
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
                    className="rounded-full border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
      {selectedItem ? (
        <NotionPromptModal
          open={modalOpen}
          onOpenChange={handleCloseModal}
          title={selectedItem.title}
          content={modalContent}
        />
      ) : null}
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
