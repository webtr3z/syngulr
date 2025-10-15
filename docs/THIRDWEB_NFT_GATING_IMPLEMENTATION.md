# 🔐 NFT Token-Gated Authentication Implementation Guide

## Overview

This document provides complete instructions for implementing NFT-based authentication in Syngulr using the Thirdweb SDK. Users must own a specific NFT to access the dashboard.

---

## 📚 Reference Repositories

### Primary Reference

- **NFT Gated Website**: <https://github.com/thirdweb-example/nft-gated-website>
  - Server-side authentication with Auth SDK
  - NFT balance checking
  - Restricted content access
  - **Note**: Repository uses Mumbai (deprecated), switch to another chain

### Secondary Reference

- **Gated Content Example**: <https://github.com/thirdweb-example/gated-content-example>
  - Modern App Router patterns
  - Client-side gating components
  - Token validation flows

---

## 🎯 Implementation Goals

### User Flow

```mermaid
graph TD
    A[Landing Page] -->|Click CTA| B[/auth Page]
    B -->|Connect Wallet| C{Has NFT?}
    C -->|Yes| D[Redirect to /flow Dashboard]
    C -->|No| E[Show Error + Link to /claim]
    E -->|Click Link| F[/claim Page]
    D -->|Access Dashboard| G[Protected Routes]
    G -->|No Wallet/NFT| B
```

### Specific Requirements

1. **Entry Points**

   - "Comienza tu viaje" button → `/auth`
   - "Empezar" button → `/auth`

2. **Authentication Flow** (`/auth`)

   - Display Thirdweb ConnectButton
   - User connects wallet and signs message
   - Validate NFT ownership

3. **Routing Logic**

   - ✅ **Has NFT**: Redirect to `/flow` (dashboard)
   - ❌ **No NFT**: Show message "Necesitas un token de acceso. Obténlo [aquí](/claim)"

4. **Claim Page** (`/claim`)

   - Generic placeholder message
   - Future: NFT claiming/purchasing functionality

5. **Dashboard Protection**
   - All `(dashboard)` routes require authentication
   - Check wallet connection + NFT ownership
   - Redirect to `/auth` if unauthorized

---

## 🏗️ Current Codebase Context

### Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Language**: Spanish (UI)

### Existing Security Infrastructure

✅ **Already Implemented**:

- Type-safe environment variables (`src/lib/env.ts`)
- Server/client separation with Zod validation
- Automatic secret redaction (`src/lib/security/`)
- Security headers via middleware
- Secure logging system

**Environment System Usage**:

```typescript
// Server-side (API routes, server components)
import { env } from "@/lib/env";
const secretKey = env.THIRDWEB_SECRET_KEY;

// Client-side (client components)
import { clientEnv } from "@/lib/env";
const clientId = clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
```

### File Structure

```plaintext
syngulr/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Landing page with CTAs
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # Protected layout
│   │   │   ├── flow/
│   │   │   ├── artefactos/
│   │   │   ├── contexts/
│   │   │   └── settings/
│   │   └── api/
│   ├── components/
│   │   └── ui/                   # Shadcn components
│   └── lib/
│       ├── env.ts                # Environment variables
│       └── security/             # Security utilities
└── .env.example
```

---

## 📦 Installation

### Step 1: Install Thirdweb SDK

```bash
pnpm add thirdweb
```

### Step 2: Update Environment Variables

Add to `.env.example`:

```bash
# ============================================
# THIRDWEB CONFIGURATION
# ============================================

# Public - Thirdweb Client ID (safe to expose)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

# Public - NFT Contract Address for gating
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=

# Public - Blockchain Chain ID (1 = Ethereum, 137 = Polygon, etc.)
NEXT_PUBLIC_CHAIN_ID=1

# Public - Authentication Domain
NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN=localhost:3000

# Private - Thirdweb Secret Key (NEVER expose to client)
THIRDWEB_SECRET_KEY=

# Private - Admin Wallet Private Key for signing (NEVER expose to client)
THIRDWEB_ADMIN_PRIVATE_KEY=
```

Update your `.env.local` with actual values:

1. Get `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` and `THIRDWEB_SECRET_KEY` from [thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Deploy or import your NFT contract and copy its address
3. Export your admin wallet's private key (for server-side signing)

### Step 3: Update Environment Schema

**CRITICAL**: The project uses a secure environment variable system that prevents accidental client-side exposure. You MUST follow these rules:

#### Environment Variable Security Rules

1. **Server-Side Variables** (Secret/Private)

   - Defined in the `server` schema in `src/lib/env.ts`
   - NEVER prefixed with `NEXT_PUBLIC_`
   - Only accessible in server components, API routes, and middleware
   - Usage: `import { env } from "@/lib/env"`

2. **Client-Side Variables** (Public/Safe)

   - Defined in the `client` schema in `src/lib/env.ts`
   - MUST be prefixed with `NEXT_PUBLIC_`
   - Usage: `import { clientEnv } from "@/lib/env"`

3. **Adding New Variables**
   - Update both the schema in `src/lib/env.ts` AND `.env.example`
   - Server variables go in the `server` object
   - Client variables go in the `client` object with `NEXT_PUBLIC_` prefix

#### Update `src/lib/env.ts`

Add these variables to the existing schemas:

```typescript
// In the server schema (add to existing server object):
server: {
  // ... existing server vars ...
  THIRDWEB_SECRET_KEY: z.string().min(1),
  THIRDWEB_ADMIN_PRIVATE_KEY: z.string().min(1).optional(),
}

// In the client schema (add to existing client object):
client: {
  // ... existing client vars ...
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  NEXT_PUBLIC_CHAIN_ID: z.string().regex(/^\d+$/),
  NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN: z.string().min(1),
}
```

#### Correct Usage Examples

**❌ WRONG - Exposes secrets to client:**

```typescript
// Don't do this!
import { env } from "@/lib/env";
export function ClientComponent() {
  const secret = env.THIRDWEB_SECRET_KEY; // ERROR!
}
```

**✅ CORRECT - Server-side only:**

```typescript
// app/api/auth/route.ts
import { env } from "@/lib/env";

export async function POST() {
  const secret = env.THIRDWEB_SECRET_KEY; // ✓ Safe
}
```

**✅ CORRECT - Client-side safe:**

```typescript
// components/WalletConnect.tsx
"use client";
import { clientEnv } from "@/lib/env";

export function WalletConnect() {
  const clientId = clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID; // ✓ Safe
}
```

**REMEMBER**: The security system in `src/lib/env.ts` already validates and separates these. Just follow the import rules!

---

## 🔧 Implementation Steps

### Step 1: Create Thirdweb Configuration

#### File: `src/lib/thirdweb/client.ts`

```typescript
import { createThirdwebClient } from "thirdweb";
import { clientEnv } from "@/lib/env";

export const client = createThirdwebClient({
  clientId: clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});
```

#### File: `src/lib/thirdweb/chains.ts`

```typescript
import { defineChain } from "thirdweb/chains";
import { clientEnv } from "@/lib/env";

// Define supported chains
export const activeChain = defineChain(Number(clientEnv.NEXT_PUBLIC_CHAIN_ID));

// Export commonly used chains
export { ethereum, polygon, base } from "thirdweb/chains";
```

#### File: `src/lib/thirdweb/contract.ts`

```typescript
import { getContract } from "thirdweb";
import { client } from "./client";
import { activeChain } from "./chains";
import { clientEnv } from "@/lib/env";

export const nftContract = getContract({
  client,
  chain: activeChain,
  address: clientEnv.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
});
```

---

### Step 2: Setup Thirdweb Provider

#### File: `src/app/providers.tsx`

```typescript
"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
```

#### Update: `src/app/layout.tsx`

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
```

---

### Step 3: Create Authentication Components

#### File: `src/components/auth/WalletConnect.tsx`

```typescript
"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb/client";
import { activeChain } from "@/lib/thirdweb/chains";

export function WalletConnect() {
  return (
    <ConnectButton
      client={client}
      chain={activeChain}
      theme="dark"
      connectButton={{
        label: "Conectar Wallet",
      }}
      connectModal={{
        title: "Conecta tu wallet",
        titleIcon: "",
        showThirdwebBranding: false,
      }}
    />
  );
}
```

#### File: `src/components/auth/TokenGate.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { nftContract } from "@/lib/thirdweb/contract";
import { balanceOf } from "thirdweb/extensions/erc721";

interface TokenGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function TokenGate({ children, redirectTo = "/auth" }: TokenGateProps) {
  const account = useActiveAccount();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const { data: balance, isLoading } = useReadContract(
    balanceOf,
    account
      ? {
          contract: nftContract,
          owner: account.address,
        }
      : undefined
  );

  useEffect(() => {
    if (!account) {
      router.push(redirectTo);
      return;
    }

    if (!isLoading) {
      if (!balance || balance === 0n) {
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [account, balance, isLoading, router, redirectTo]);

  if (!account || isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

### Step 4: Create Auth Page

#### File: `src/app/(public)/auth/page.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { WalletConnect } from "@/components/auth/WalletConnect";
import { nftContract } from "@/lib/thirdweb/contract";
import { balanceOf } from "thirdweb/extensions/erc721";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthPage() {
  const account = useActiveAccount();
  const router = useRouter();

  const { data: balance, isLoading } = useReadContract(
    balanceOf,
    account
      ? {
          contract: nftContract,
          owner: account.address,
        }
      : undefined
  );

  useEffect(() => {
    if (account && !isLoading && balance && balance > 0n) {
      router.push("/flow");
    }
  }, [account, balance, isLoading, router]);

  const hasNFT = balance && balance > 0n;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md space-y-8 px-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Acceso a Syngulr
          </h1>
          <p className="text-muted-foreground">
            Conecta tu wallet para acceder a la plataforma
          </p>
        </div>

        {!account ? (
          <div className="space-y-4">
            <WalletConnect />
            <p className="text-sm text-muted-foreground">
              Usa MetaMask, WalletConnect, o cualquier wallet compatible
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Verificando tu token de acceso...
            </p>
          </div>
        ) : !hasNFT ? (
          <div className="space-y-6 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-destructive">
                Token de Acceso Requerido
              </h2>
              <p className="text-sm text-muted-foreground">
                Necesitas un token de acceso para ingresar a Syngulr.
              </p>
            </div>
            <Button asChild variant="default" className="w-full">
              <Link href="/claim">Obténlo aquí</Link>
            </Button>
            <div className="pt-4 border-t">
              <WalletConnect />
              <p className="mt-2 text-xs text-muted-foreground">
                ¿Conectaste la wallet incorrecta?
              </p>
            </div>
          </div>
        ) : null}

        <div className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Create Claim Page

#### File: `src/app/(public)/claim/page.tsx`

```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Obtén tu Token de Acceso | Syngulr",
  description: "Consigue tu token de acceso NFT para usar Syngulr",
};

export default function ClaimPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Obtén tu Token de Acceso
          </h1>
          <p className="text-xl text-muted-foreground">
            El token NFT de Syngulr te da acceso completo a la plataforma
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 text-left">
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
          <Button asChild variant="default" size="lg">
            <Link href="/auth">Conectar Wallet</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          ¿Ya tienes un token? Intenta{" "}
          <Link href="/auth" className="text-primary hover:underline">
            conectar tu wallet
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 6: Update Landing Page CTAs

#### Update: `src/app/(public)/page.tsx`

Find the CTA buttons and update their links:

```typescript
// Replace the existing button with:
<Button size="lg" asChild className="h-[56px]">
  <Link href="/auth" aria-label="Comienza tu viaje con Syngulr">
    Comienza tu viaje
    <ArrowRight className="h-4 w-4" aria-hidden="true" />
  </Link>
</Button>

// If there's an "Empezar" button, update it similarly:
<Button size="lg" asChild>
  <Link href="/auth">
    Empezar
  </Link>
</Button>
```

---

### Step 7: Protect Dashboard Routes

#### Update: `src/app/(dashboard)/layout.tsx`

```typescript
import { TokenGate } from "@/components/auth/TokenGate";
import { MainNav } from "@/components/sidebar/MainNav";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TokenGate>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-card">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">Syngulr</h1>
          </div>
          <MainNav />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </TokenGate>
  );
}
```

---

### Step 8: Add Wallet Info to Sidebar (Optional)

#### File: `src/components/sidebar/UserWallet.tsx`

```typescript
"use client";

import { useActiveAccount } from "thirdweb/react";
import { WalletConnect } from "@/components/auth/WalletConnect";
import { maskAddress } from "@/lib/security/sanitize";

export function UserWallet() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className="border-t p-4">
        <WalletConnect />
      </div>
    );
  }

  return (
    <div className="border-t p-4 space-y-2">
      <p className="text-xs text-muted-foreground">Wallet Conectada</p>
      <p className="text-sm font-mono font-medium">
        {maskAddress(account.address)}
      </p>
      <WalletConnect />
    </div>
  );
}
```

Add to `src/components/sidebar/MainNav.tsx`:

```typescript
import { UserWallet } from "./UserWallet";

// At the bottom of your nav component:
export function MainNav({ collapsed = false }: MainNavProps) {
  // ... existing nav items ...

  return (
    <div className="flex flex-col h-full">
      <nav
        className={cn(
          "mt-8 flex-1 flex flex-col gap-1",
          collapsed ? "px-2" : "px-4"
        )}
      >
        {/* ... nav items ... */}
      </nav>
      <UserWallet />
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### Pre-Deployment Tests

- [ ] **Environment Variables**

  - [ ] All Thirdweb env vars set in `.env.local`
  - [ ] Client ID valid and working
  - [ ] Contract address is correct
  - [ ] Chain ID matches your network

- [ ] **Landing Page**

  - [ ] "Comienza tu viaje" button redirects to `/auth`
  - [ ] "Empezar" button (if exists) redirects to `/auth`

- [ ] **Auth Page (`/auth`)**

  - [ ] WalletConnect button displays
  - [ ] Can connect MetaMask
  - [ ] Can connect WalletConnect
  - [ ] Loading state shows during NFT check
  - [ ] Redirects to `/flow` if user has NFT
  - [ ] Shows error message if user doesn't have NFT
  - [ ] Error message includes link to `/claim`

- [ ] **Claim Page (`/claim`)**

  - [ ] Page loads correctly
  - [ ] Displays placeholder content
  - [ ] Has link back to `/auth`
  - [ ] Has link back to `/`

- [ ] **Dashboard Protection**

  - [ ] Cannot access `/flow` without wallet
  - [ ] Cannot access `/flow` without NFT
  - [ ] Redirects to `/auth` if unauthorized
  - [ ] Dashboard loads correctly with valid NFT

- [ ] **Wallet Functionality**
  - [ ] Can disconnect wallet
  - [ ] Can switch wallets
  - [ ] Can switch networks
  - [ ] Wallet info displays in sidebar

### Build & Deploy Tests

- [ ] **Build**

  - [ ] `pnpm build` succeeds
  - [ ] No TypeScript errors
  - [ ] No linting errors
  - [ ] All routes compile

- [ ] **Production Environment**
  - [ ] Environment variables set on hosting platform
  - [ ] Auth domain matches production URL
  - [ ] SSL/HTTPS working
  - [ ] Wallet connection works in production

---

## 🔍 Troubleshooting

### Common Issues

#### "Cannot read properties of undefined (reading 'address')"

**Cause**: Trying to read account before it's connected

**Solution**: Add proper null checks:

```typescript
const { data: balance } = useReadContract(
  balanceOf,
  account ? { contract: nftContract, owner: account.address } : undefined
);
```

#### "Contract not found" or "Invalid contract address"

**Cause**: Wrong contract address or chain

**Solutions**:

1. Verify `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` is correct
2. Ensure `NEXT_PUBLIC_CHAIN_ID` matches where contract is deployed
3. Import contract in thirdweb dashboard if not deployed there

#### Infinite redirect loop

**Cause**: Auth logic redirecting back and forth

**Solution**: Check your redirect conditions:

```typescript
// Only redirect if we've finished loading
if (!isLoading && !balance) {
  router.push("/auth");
}
```

#### "Build failed" with env validation errors

**Cause**: Missing environment variables during build

**Solution**: Use skip flag for CI/CD:

```bash
SKIP_ENV_VALIDATION=true pnpm build
```

Or set all env vars in your CI/CD platform.

---

## 📊 Architecture Diagram

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                        Landing Page (/)                      │
│                                                              │
│  [Comienza tu viaje] ───┐                                   │
│  [Empezar]              │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Auth Page (/auth)                       │
│                                                              │
│  1. Show ConnectButton                                       │
│  2. User connects wallet                                     │
│  3. Check NFT balance ──────────┬───────────────┐           │
│                                 │               │           │
│                          Has NFT?               │           │
│                                 │               │           │
│                          Yes    │    No         │           │
│                                 │               │           │
└─────────────────────────────────┼───────────────┼───────────┘
                                  │               │
                                  ▼               ▼
                    ┌─────────────────┐  ┌─────────────────┐
                    │  Redirect to    │  │  Show Error +   │
                    │  /flow          │  │  Link to /claim │
                    │  (Dashboard)    │  └────────┬────────┘
                    └────────┬────────┘           │
                             │                    ▼
                             │          ┌─────────────────┐
                             │          │  Claim Page     │
                             │          │  (/claim)       │
                             │          │                 │
                             │          │  [Get NFT]      │
                             │          └─────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Protected Dashboard Routes                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           TokenGate Wrapper (layout.tsx)             │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │  Check: Is wallet connected?                │    │  │
│  │  │  Check: Does wallet own NFT?                │    │  │
│  │  │                                              │    │  │
│  │  │  ✓ Yes → Render children (dashboard)        │    │  │
│  │  │  ✗ No  → Redirect to /auth                  │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                       │  │
│  │  [/flow] [/artefactos] [/contexts] [/settings]      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

### Environment Variables

✅ **Protected** (Never exposed to client):

- `THIRDWEB_SECRET_KEY` - API secret
- `THIRDWEB_ADMIN_PRIVATE_KEY` - Wallet private key

✅ **Public** (Safe to expose):

- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Client ID
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` - Contract address
- `NEXT_PUBLIC_CHAIN_ID` - Network ID

### Best Practices

1. **Never commit** `.env.local` to version control
2. **Always use** the env system (`import { env } from '@/lib/env'`)
3. **Validate** environment variables on startup
4. **Rotate** API keys and private keys regularly
5. **Use different** keys for dev/staging/production

### Private Key Safety

⚠️ **CRITICAL**: The `THIRDWEB_ADMIN_PRIVATE_KEY` should be:

- Generated specifically for this app
- Never used for storing real assets
- Rotated if ever exposed
- Stored securely in production environment

---

## 📚 Additional Resources

### Thirdweb Documentation

- [Thirdweb SDK v5](https://portal.thirdweb.com/)
- [Authentication](https://portal.thirdweb.com/auth)
- [React Hooks](https://portal.thirdweb.com/react)
- [Contract Interactions](https://portal.thirdweb.com/contracts)

### Related Guides

- [NFT Gating Tutorial](https://blog.thirdweb.com/guides/nft-gated-website/)
- [Token Gating Best Practices](https://blog.thirdweb.com/guides/token-nft-gated-shopify-website-thirdweb/)

### Syngulr Documentation

- `src/lib/security/README.md` - Security utilities
- `.env.example` - Environment variable template

---

## 🚀 Deployment

### Vercel Deployment

1. **Set Environment Variables** in Vercel dashboard:

   - All `NEXT_PUBLIC_*` variables
   - `THIRDWEB_SECRET_KEY`
   - `THIRDWEB_ADMIN_PRIVATE_KEY`

2. **Update Auth Domain**:

   ```bash
   NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN=yourdomain.vercel.app
   ```

3. **Deploy**:

   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

### Other Platforms

Ensure you:

- Set all environment variables
- Update `NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN` to your production domain
- Use production-grade private keys
- Enable HTTPS

---

## ✅ Success Criteria

Implementation is complete when:

- [ ] User can click CTAs and land on `/auth`
- [ ] Wallet connection works (MetaMask, WalletConnect, etc.)
- [ ] NFT ownership is validated correctly
- [ ] Users with NFT are redirected to `/flow`
- [ ] Users without NFT see error message
- [ ] Error message links to `/claim`
- [ ] `/claim` page exists and is accessible
- [ ] Dashboard routes are protected
- [ ] Unauthorized users are redirected to `/auth`
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] All UI text is in Spanish
- [ ] Works on mobile and desktop
- [ ] Production deployment successful

---

## 🎯 Next Steps After Implementation

1. **Customize `/claim` page**

   - Add NFT minting functionality
   - Implement payment processing
   - Add NFT marketplace integration

2. **Enhance User Experience**

   - Add wallet disconnection UI
   - Show NFT metadata in dashboard
   - Display user's NFT collection

3. **Advanced Features**

   - Role-based access (different NFTs = different permissions)
   - Multi-NFT requirements
   - Time-limited access tokens
   - NFT traits-based features

4. **Analytics**
   - Track wallet connections
   - Monitor NFT ownership distribution
   - Analyze user authentication patterns

---

## 📝 Implementation Checklist

### Phase 1: Setup

- [ ] Install `pnpm add thirdweb`
- [ ] Add environment variables to `.env.example`
- [ ] Fill `.env.local` with actual values
- [ ] Get Thirdweb Client ID and Secret Key

### Phase 2: Configuration

- [ ] Create `src/lib/thirdweb/client.ts`
- [ ] Create `src/lib/thirdweb/chains.ts`
- [ ] Create `src/lib/thirdweb/contract.ts`
- [ ] Create `src/app/providers.tsx`
- [ ] Update `src/app/layout.tsx`

### Phase 3: Components

- [ ] Create `src/components/auth/WalletConnect.tsx`
- [ ] Create `src/components/auth/TokenGate.tsx`
- [ ] Create `src/components/sidebar/UserWallet.tsx`

### Phase 4: Pages

- [ ] Create `src/app/(public)/auth/page.tsx`
- [ ] Create `src/app
