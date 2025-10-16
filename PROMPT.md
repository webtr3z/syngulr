# 🎯 Syngulr Dashboard Enhancement Tasks

## Context

You are working on **Syngulr**, a Next.js 15 application with:

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: Full type safety required
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Shadcn/ui components in `src/components/ui/`
- **Language**: Spanish (all UI text)
- **Theme**: Dark/Light mode with `next-themes`
- **Authentication**: Thirdweb wallet-based NFT gating

---

## 🎯 Objectives

You must complete **3 specific tasks**. Each task has detailed requirements below.

---

## 📋 Task 1: Move Wallet Widget to Top-Right Corner

### Current State

- `UserWallet` component is currently at the **bottom of the sidebar** in `MainLayout`
- Located in: `src/components/sidebar/UserWallet.tsx`
- Rendered at bottom of: `src/components/sidebar/MainNav.tsx`

### Required Changes

#### 1.1 Remove from Sidebar

**File**: `src/components/sidebar/MainNav.tsx`

Remove the `<UserWallet />` component from the bottom of the navigation.

**Before**:

```typescript
return (
  <div className="flex h-full flex-1 flex-col">
    <nav>{/* nav items */}</nav>
    <UserWallet collapsed={collapsed} /> // ← Remove this
  </div>
);
```

**After**:

```typescript
return (
  <nav
    className={cn(
      "mt-8 flex-1 flex flex-col gap-1",
      collapsed ? "px-2" : "px-4"
    )}
  >
    {navItems.map((item) => {
      // ... nav items
    })}
  </nav>
);
```

#### 1.2 Add Top Bar to MainLayout

**File**: `src/app/layouts/MainLayout.tsx`

Add a new top bar positioned at the top-right of the main content area.

**Structure**:

```typescript
<div className="flex min-h-screen bg-background text-foreground">
  <aside>{/* Existing sidebar */}</aside>

  {/* NEW: Top Bar */}
  <div className="flex flex-1 flex-col">
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-border bg-card/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <UserWallet collapsed={false} />
    </header>

    <main className="flex-1 overflow-hidden bg-background">{children}</main>
  </div>
</div>
```

#### 1.3 Update UserWallet Component

**File**: `src/components/sidebar/UserWallet.tsx`

Update the component to work in horizontal layout (top bar) instead of vertical (sidebar).

**Changes**:

- Remove `collapsed` prop handling (no longer needed in top bar)
- Simplify layout to horizontal flex
- Adjust styling for top bar context

**New Structure**:

```typescript
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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <p className="text-sm font-medium text-muted-foreground">
          Wallet conectada
        </p>
      </div>
      <WalletConnect />
    </div>
  );
}
```

---

## 📋 Task 2: Add Copy Functionality to Contextos Modal

### Current State

- Route: `src/app/(dashboard)/contexts/page.tsx`
- Uses `NotionItemsList` component to display items
- Items have an "Abrir" button that opens a modal (needs to be implemented)

### Required Changes

#### 2.1 Create Modal Component

**File**: `src/components/notion/NotionPromptModal.tsx`

Create a new modal component that displays Notion prompt content with copy functionality.

**Requirements**:

- Use Radix UI Dialog component (already available in the project)
- Display full prompt content
- Two copy buttons:
  1. **Copy as Markdown** (icon: `FileText`)
  2. **Copy as Raw Text** (icon: `Copy`)
- Use tooltip for each button
- Show toast notification on copy success
- Spanish language for all UI text

**Component Structure**:

```typescript
"use client";

import { useState } from "react";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotionPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

export function NotionPromptModal({
  open,
  onOpenChange,
  title,
  content,
}: NotionPromptModalProps) {
  const copyAsMarkdown = async () => {
    // Convert content to markdown format
    const markdown = `# ${title}\n\n${content}`;
    await navigator.clipboard.writeText(markdown);
    toast.success("Copiado como Markdown");
  };

  const copyAsRawText = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copiado como texto");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Contenido del prompt desde Notion
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAsMarkdown}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar como Markdown</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAsRawText}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar texto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 rounded-lg border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 2.2 Update NotionItemsList Component

**File**: `src/components/notion/NotionItemsList.tsx`

Add modal state and trigger to open the modal when "Abrir" button is clicked.

**Changes Needed**:

1. Import the new `NotionPromptModal` component
2. Add state for modal open/close and selected item
3. Update "Abrir" button to open modal instead of external link
4. Render the modal component

**Key Code Changes**:

```typescript
import { NotionPromptModal } from "./NotionPromptModal";

export function NotionItemsList({ ... }) {
  const [selectedItem, setSelectedItem] = useState<NotionPage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (item: NotionPage) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <>
      <section>
        {/* ... existing list code ... */}

        {/* Update button in the map */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenModal(item)}
          aria-label="Abrir prompt"
        >
          Abrir
        </Button>
      </section>

      {/* Add modal */}
      {selectedItem && (
        <NotionPromptModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={selectedItem.title}
          content={selectedItem.description || "Sin contenido"}
        />
      )}
    </>
  );
}
```

#### 2.3 Ensure Dialog Component Exists

**File**: `src/components/ui/dialog.tsx`

If this file doesn't exist, create it using Shadcn's Dialog component:

```bash
# Run this command if dialog doesn't exist
npx shadcn@latest add dialog
```

---

## 📋 Task 3: Create Generator Route

### Required Changes

#### 3.1 Create Generator Page

**File**: `src/app/(dashboard)/generator/page.tsx`

Create a new page for the prompt generator with a chat-like interface.

**Requirements**:

- Chat interface for talking with an AI agent
- Input area for user messages
- Display area for conversation history
- Spanish language
- Clean, modern UI matching existing design system

**Complete Component**:

```typescript
"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Note: Metadata export should be in a separate file for client components
// For now, this is a client component, so no metadata export

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function GeneratorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente para generar prompts especializados. ¿En qué tipo de prompt te puedo ayudar hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // TODO: Integrate with your AI service
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Esta es una respuesta de ejemplo. Integra aquí tu servicio de IA para generar prompts especializados.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Generador de Prompts</h1>
            <p className="text-sm text-muted-foreground">
              Crea prompts especializados con ayuda de IA
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {message.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <span className="text-xs font-semibold text-primary-foreground">
                    TÚ
                  </span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              </div>
              <div className="rounded-lg bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe el tipo de prompt que necesitas..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Presiona Enter para enviar, Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 3.2 Add Navigation Link

**File**: `src/components/sidebar/MainNav.tsx`

Add the new Generator route to the navigation menu.

**Add to navItems array**:

```typescript
import {
  Archive,
  Home,
  Layers,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/flow",
    label: "Diagrama",
    icon: Workflow,
  },
  {
    href: "/artefactos",
    label: "Artefactos",
    icon: Archive,
  },
  {
    href: "/contexts",
    label: "Contextos",
    icon: Layers,
  },
  {
    href: "/generator", // ← Add this
    label: "Generador", // ← Add this
    icon: Sparkles, // ← Add this
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: Settings,
  },
];
```

---

## ✅ Validation Checklist

After completing all tasks, verify:

### Task 1: Wallet Widget

- [ ] Wallet widget removed from sidebar bottom
- [ ] Top bar added to MainLayout with wallet widget
- [ ] Top bar is sticky and at top-right
- [ ] Wallet widget displays correctly when connected
- [ ] Wallet widget displays WalletConnect button when disconnected
- [ ] No layout shifts or visual glitches

### Task 2: Contextos Modal

- [ ] Modal opens when clicking "Abrir" button
- [ ] Modal displays full prompt content
- [ ] Copy as Markdown button works (with icon and tooltip)
- [ ] Copy as Raw Text button works (with icon and tooltip)
- [ ] Toast notification appears on successful copy
- [ ] Modal can be closed
- [ ] All text is in Spanish

### Task 3: Generator Route

- [ ] New route `/generator` is accessible
- [ ] Page displays in dashboard layout with top bar
- [ ] Chat interface is functional
- [ ] User can type and send messages
- [ ] Messages display correctly (user on right, assistant on left)
- [ ] Loading state shows when processing
- [ ] Navigation link appears in sidebar
- [ ] Enter key sends message
- [ ] Shift + Enter creates new line
- [ ] All UI text is in Spanish

---

## 🚨 Important Constraints

1. **DO NOT modify** any files not explicitly mentioned in the tasks
2. **DO NOT change** existing functionality outside of these tasks
3. **DO NOT remove** any existing features
4. **DO NOT modify** authentication or security code
5. **DO NOT change** the color scheme or theme system
6. **MAINTAIN** all existing TypeScript types
7. **MAINTAIN** Spanish language for all UI text
8. **TEST** that the build completes successfully after changes

---

## 🔧 Technical Requirements

- **TypeScript**: Use proper types for all components and props
- **Imports**: Use `@/` path alias for all imports
- **Components**: Follow existing component patterns in the codebase
- **Styling**: Use Tailwind CSS classes only
- **Icons**: Use `lucide-react` icons only
- **Toasts**: Use `sonner` library for notifications
- **Tooltips**: Use Radix UI tooltip component from `@/components/ui/tooltip`

---

## 📚 File References

### Key Files to Modify

1. `src/app/layouts/MainLayout.tsx` - Add top bar
2. `src/components/sidebar/MainNav.tsx` - Remove UserWallet, add Generator link
3. `src/components/sidebar/UserWallet.tsx` - Simplify for top bar usage
4. `src/components/notion/NotionItemsList.tsx` - Add modal functionality
5. `src/components/notion/NotionPromptModal.tsx` - CREATE NEW
6. `src/app/(dashboard)/generator/page.tsx` - CREATE NEW

### Key Components Already Available

- `Button` - `@/components/ui/button`
- `Textarea` - `@/components/ui/textarea`
- `Tooltip` - `@/components/ui/tooltip`
- `Dialog` - `@/components/ui/dialog` (may need to be added)

---

## 🎯 Expected Outcome

After completing all tasks:

1. **Wallet widget** appears in the top-right corner of the dashboard in a sticky top bar
2. **Contextos page** allows viewing prompts in a modal with copy functionality
3. **New Generator route** provides a chat interface for creating specialized prompts
4. **All features** work seamlessly with existing authentication and theme system
5. **Build succeeds** with no errors or warnings
6. **All UI text** is in Spanish

---

## 🚀 Build & Test Commands

```bash
# Type check
pnpm typecheck

# Build
pnpm build

# Run dev server
pnpm dev

# Lint
pnpm lint
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-16  
**Status**: Ready for Implementation
