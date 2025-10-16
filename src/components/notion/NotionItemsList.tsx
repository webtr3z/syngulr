"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const MarkdownCode = ({
  inline,
  className,
  children,
  ...rest
}: {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}) => {
  const language = /language-(\w+)/.exec(className ?? "")?.[1];
  const content = String(children ?? "");

  if (inline) {
    return (
      <code
        className="rounded-md bg-muted px-1.5 py-0.5 text-sm text-foreground"
        {...rest}
      >
        {children}
      </code>
    );
  }

  return (
    <SyntaxHighlighter
      {...rest}
      style={oneDark}
      language={language ?? "markdown"}
      PreTag="div"
      customStyle={{
        margin: 0,
        borderRadius: "1rem",
        padding: "1.25rem",
        fontSize: "0.875rem",
      }}
    >
      {content.replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
};

const markdownComponents = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-3xl font-semibold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-2xl font-semibold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-xl font-semibold text-foreground" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-sm leading-relaxed text-muted-foreground" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc space-y-2 pl-5 text-sm text-muted-foreground"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-primary underline-offset-4 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  code: MarkdownCode,
} satisfies Components;

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<NotionPage | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalMarkdown, setModalMarkdown] = useState<string | null>(null);

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

  const activePageId = activeItem?.id;

  useEffect(() => {
    if (!isModalOpen || !activePageId) {
      return;
    }

    const controller = new AbortController();
    setIsModalLoading(true);
    setModalMarkdown(null);
    setModalError(null);

    fetchNotionMarkdown({ pageId: activePageId, signal: controller.signal })
      .then((markdown) => {
        setModalMarkdown(markdown);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Error fetching Notion page:", requestError);
        setModalError(
          requestError instanceof Error
            ? requestError.message
            : "No se pudo cargar el contenido."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsModalLoading(false);
        }
      });

    return () => controller.abort();
  }, [activePageId, isModalOpen]);

  const openModal = useCallback((item: NotionPage) => {
    setActiveItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveItem(null);
    setModalMarkdown(null);
    setModalError(null);
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
                    variant="secondary"
                    size="sm"
                    type="button"
                    className="rounded-full px-4 text-xs font-medium transition-transform duration-200 hover:-translate-y-0.5"
                    aria-label="Abrir artefacto"
                    onClick={() => openModal(item)}
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
      <NotionContentModal
        open={isModalOpen}
        onClose={closeModal}
        item={activeItem}
        loading={isModalLoading}
        error={modalError}
      >
        {modalMarkdown ? (
          <div className="space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {modalMarkdown}
            </ReactMarkdown>
          </div>
        ) : null}
      </NotionContentModal>
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

interface NotionContentModalProps {
  open: boolean;
  onClose: () => void;
  item: NotionPage | null;
  loading: boolean;
  error: string | null;
  children: ReactNode;
}

function NotionContentModal({
  open,
  onClose,
  item,
  loading,
  error,
  children,
}: NotionContentModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const timeout = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timeout);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notion-modal-title"
        aria-describedby="notion-modal-description"
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl"
      >
        <header className="flex flex-col gap-3 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 pr-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Artefacto de Notion
            </p>
            <h2
              id="notion-modal-title"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            >
              {item?.title ?? "Artefacto"}
            </h2>
            {item?.description ? (
              <p
                id="notion-modal-description"
                className="text-sm text-muted-foreground"
              >
                {item.description}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {item?.status ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wide"
                >
                  {item.status}
                </Badge>
              ) : null}
              {item ? (
                <>
                  <MetaItem label="Creado" value={item.createdTime} />
                  <MetaItem label="Actualizado" value={item.lastEditedTime} />
                </>
              ) : null}
              {item?.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/40 px-3 py-1 text-[11px] font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar"
            className="ml-auto h-9 w-9 rounded-full border border-border/60 bg-background/80 text-muted-foreground transition hover:text-foreground"
            onClick={onClose}
          >
            <span aria-hidden="true" className="text-base">
              ×
            </span>
          </Button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <div className="loader-circle" aria-hidden="true" />
              Cargando contenido...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-sm leading-relaxed text-destructive">
              {error}
            </div>
          ) : children ? (
            <div className="space-y-6">{children}</div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay contenido disponible para este artefacto.
            </p>
          )}
        </div>
        <footer className="flex justify-end gap-3 border-t border-border/70 px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {item?.url ? (
            <Button asChild variant="secondary">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="no-underline"
              >
                Abrir en Notion
              </a>
            </Button>
          ) : null}
        </footer>
      </section>
    </div>
  );

  return createPortal(content, document.body);
}
