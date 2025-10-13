# AGENTS.md

## Purpose
Single source of truth for coding agents working on this repo. Keep READMEs focused on humans; put agent-facing instructions here.

## Stack
- Next.js (App Router) + TypeScript + ESLint
- Tailwind CSS v4 with PostCSS plugin
- shadcn/ui (default style, CSS variables, baseColor: neutral)

## Setup Commands
- Install: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Start: `pnpm start`

## Project Conventions
- Import alias: `@/*`
- Components live under `@/components` and `@/components/ui`
- Use `cn()` from `@/lib/utils` for class merging
- **No hard-coded colors**: use theme tokens `bg-background text-foreground`, `bg-primary`, etc.
- Prefer Server Components; use `"use client"` only when necessary

## Tailwind v4 Rules
- Tailwind is imported via `@import "tailwindcss";` in `app/globals.css`
- No `tailwind.config.*` unless strictly required (v4 default)
- PostCSS plugin: `@tailwindcss/postcss` configured in `postcss.config.mjs`

## shadcn/ui Rules
- Defaults enforced in `components.json`
- Add components with: `pnpm dlx shadcn@latest add <component>`
- Keep styles consistent with default theme and CSS variables

## Definition of Done
- `pnpm lint` and `pnpm typecheck` pass
- Page renders with no console errors
- New UI uses shadcn tokens and Tailwind utilities
- Tests (if added) pass locally

## Typical Agent Tasks
- Add a new UI component via shadcn CLI and wire into a page
- Build a form using shadcn <Input />, <Label />, with proper accessibility
- Create responsive layouts using Tailwind v4 utilities
- Refactor to Server Components where feasible

## Validation
- Run `pnpm dev` and verify `/` renders a button and themed background
- Ensure dark/light variables apply via `bg-background text-foreground`
