# Flowchart Editor

This project is a Next.js 15 application that ships a typed flowchart editor powered by React Flow, Tailwind v4, shadcn/ui, and Zustand.

## Stack

- Next.js App Router (TypeScript, strict mode)
- Tailwind CSS v4 with shadcn/ui components
- React Flow (`@xyflow/react`) for the canvas and custom nodes
- Zustand + Zod for state, validation, and undo/redo
- ELK.js for optional auto layout
- Sonner toasts and IndexedDB persistence via `idb-keyval`

## Prerequisites

- Node.js >= 18.17
- pnpm 9 (recommended)

## Setup

```bash
pnpm install
```

## Core Commands

```bash
pnpm dev          # start Next.js locally on http://localhost:3000
pnpm lint         # run ESLint
pnpm typecheck    # strict TypeScript check
pnpm test:unit    # Vitest unit tests (store + schema)
pnpm test:e2e     # Playwright e2e flow (see note below)
```

> **Playwright note:** run `pnpm exec playwright install` once before `pnpm test:e2e` so the Chromium browser is available.

## Features

- Custom shadcn `Card` nodes with left/right connection handles and context menu (edit, duplicate, delete)
- Toolbar actions: add box, auto layout (ELK, LR/TB), fit view, undo/redo, JSON export/import, reset
- Keyboard shortcuts: `N` add node, `Delete/Backspace` delete selection, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` redo, `F` fit view
- Optional auto layout (LR/TB) with animated fit
- JSON import/export validated via Zod schema
- Autosave to IndexedDB; reset clears both canvas and persisted state
- Side inspector for editing title & description with live updates
- Toast feedback for import errors, layout, export/reset actions

## Routes

- `/` – marketing landing experience with public layout chrome
- `/flow` – interactive flow editor (client component)

## Environment Variables

Configura las variables según las integraciones que utilices:

- `NOTION_API_KEY`: habilita la consulta del API de Notion para rellenar listas dinámicas. Debe corresponder a una integración con acceso a la base de datos objetivo.

## SSR Considerations

React Flow is browser-only. The `/flow` route is implemented as a client component (`FlowCanvas`) and wrapped in `ReactFlowProvider`. Avoid rendering it on the server.

## E2E Scenario

The Playwright spec (`tests/e2e/flow.spec.ts`) covers adding two boxes, editing titles via the inspector, connecting them, and verifying the exported JSON payload.
