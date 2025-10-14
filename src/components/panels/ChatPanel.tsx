"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { mermaidToDocument } from "@/lib/mermaid";
import { useFlowStore } from "@/lib/store";
import { Loader2, SendHorizonal, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

const STORAGE_KEY = "syngulr-chat-history";

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("No se pudo cargar el historial de chat:", error);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const importDocument = useFlowStore((state) => state.importDocument);
  const resetFlow = useFlowStore((state) => state.reset);
  const runLayout = useFlowStore((state) => state.runLayout);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const autoResize = useCallback(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

  useEffect(() => {
    const handler = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const appendMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "createdAt">) => {
      const now = Date.now();
      const newMessage: ChatMessage = {
        id: `${message.role}-${now}-${Math.random().toString(36).slice(2)}`,
        createdAt: now,
        role: message.role,
        content: message.content,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage.id;
    },
    []
  );

  const updateMessage = useCallback(
    (id: string, updater: (prev: ChatMessage) => ChatMessage) => {
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? updater(message) : message))
      );
    },
    []
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (isSending) {
        return;
      }
      const trimmed = inputValue.trim();
      if (!trimmed) {
        return;
      }

      setErrorMessage(null);
      setIsSending(true);
      setInputValue("");

      const userId = appendMessage({
        role: "user",
        content: trimmed,
      });

      scrollToBottom();

      try {
        const assistantId = appendMessage({
          role: "assistant",
          content: "",
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages
              .concat([
                {
                  id: userId,
                  role: "user",
                  content: trimmed,
                  createdAt: Date.now(),
                },
              ])
              .map((message) => ({
                role: message.role,
                content: message.content,
              })),
          }),
        });

        if (!response.ok || !response.body) {
          const errorText = await response.text();
          try {
            const parsed = JSON.parse(errorText) as { error?: string };
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch {
            // ignore parse error, use default
          }
          throw new Error("La API devolvió un estado no exitoso.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          assistantContent += decoder.decode(value, { stream: true });
          updateMessage(assistantId, (prev) => ({
            ...prev,
            content: assistantContent,
          }));
          scrollToBottom();
        }

        const finalContent = assistantContent.trim();
        let parsed = false;
        try {
          const parsedJson = JSON.parse(finalContent);
          if (parsedJson && typeof parsedJson === "object") {
            parsed = true;
            const reportMessage =
              typeof (parsedJson as { reportMessage?: unknown })
                .reportMessage === "string"
                ? (parsedJson as { reportMessage: string }).reportMessage
                : finalContent;
            const mermaidSource =
              typeof (parsedJson as { mmd?: unknown }).mmd === "string"
                ? (parsedJson as { mmd: string }).mmd
                : undefined;

            updateMessage(assistantId, (prev) => ({
              ...prev,
              content: reportMessage,
            }));

            if (mermaidSource) {
              try {
                const normalized = mermaidSource.replace(/\\n/g, "\n").trim();
                const document = mermaidToDocument(normalized);
                resetFlow();
                importDocument(document);
                await runLayout().catch((error) => {
                  console.error("No se pudo aplicar el layout:", error);
                });
                toast.success(
                  "Diagrama actualizado desde la respuesta del asistente."
                );
              } catch (mermaidError) {
                console.error(
                  "No se pudo interpretar el diagrama Mermaid:",
                  mermaidError
                );
                toast.error(
                  "No se pudo convertir el diagrama Mermaid proporcionado."
                );
              }
            }
          }
        } catch {
          // not valid JSON; fall back to plain content
        }

        if (!parsed) {
          updateMessage(assistantId, (prev) => ({
            ...prev,
            content: finalContent,
          }));
        }
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Hubo un problema al procesar tu mensaje. Intenta nuevamente."
        );
      } finally {
        setIsSending(false);
        scrollToBottom();
      }
    },
    [
      appendMessage,
      importDocument,
      inputValue,
      isSending,
      messages,
      resetFlow,
      runLayout,
      scrollToBottom,
      updateMessage,
    ]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const formattedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        timestamp: new Date(message.createdAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    [messages]
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        ref={listRef}
        className="overflow-y-auto h-full rounded-lg bg-background/70 p-4"
      >
        {formattedMessages.length === 0 ? (
          <div className="flex h-full items-center text-center justify-center text-sm text-muted-foreground/50">
            Inicia una conversación para recibir ayuda contextual.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {formattedMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-1",
                  message.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {message.role === "user" ? "Tú" : "Syngulr AI"} ·{" "}
                  {message.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col items-end gap-2 rounded-lg border border-border bg-background/80 p-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="max-h-56 min-h-[56px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm focus-visible:ring-0"
            placeholder="Crea un diagrama de flujo el cual..."
            disabled={isSending}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-10 w-10 border-[0px]! hover:text-destructive"
              onClick={() => {
                setMessages([]);
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem(STORAGE_KEY);
                }
              }}
              disabled={isSending || messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Limpiar conversación</span>
            </Button>
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10"
              disabled={isSending || inputValue.trim().length === 0}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </div>
        </div>
        <div className="flex px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Enter para enviar · Shift + Enter para salto de línea · Cmd/Ctrl + K
            para enfocar
          </p>
        </div>
      </form>
    </div>
  );
}
