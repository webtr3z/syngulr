# 🔒 Security Guidelines

## Overview

This document outlines the security measures implemented in Syngulr and best practices for maintaining a secure application.

---

## 🛡️ Environment Variable Security

### Architecture

We use a **type-safe, validated environment variable system** with the following features:

1. **Strict Separation**: Client and server variables are completely isolated
2. **Runtime Validation**: All variables are validated using Zod schemas on startup
3. **Type Safety**: Full TypeScript support with autocompletion
4. **Auto-Redaction**: Sensitive data is automatically redacted from logs

### Usage Patterns

#### ✅ Correct Usage

**Server-Side (API Routes, Server Components):**

```typescript
import { env } from "@/lib/env";

// Access server secrets safely
const secretKey = env.THIRDWEB_SECRET_KEY;
```

**Client-Side (Client Components):**

```typescript
import { clientEnv } from "@/lib/env";

// Access public variables only
const clientId = clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
```

#### ❌ Incorrect Usage

```typescript
// DON'T: Never access server env from client
"use client";
import { env } from "@/lib/env";
const secret = env.THIRDWEB_SECRET_KEY; // This will throw an error!

// DON'T: Never expose secrets directly
const config = {
  secret: process.env.THIRDWEB_SECRET_KEY, // Never do this!
};
```

---

## 🔐 Private Key Security

### Storage

- **NEVER** commit private keys to version control
- Store in `.env.local` (already in `.gitignore`)
- Use different keys for dev/staging/production
- Rotate keys regularly

### Usage

```typescript
import { env } from "@/lib/env";
import { serverOnly } from "@/lib/security/runtime-check";

function usePrivateKey() {
  // Ensures this only runs on server
  serverOnly("usePrivateKey");

  const privateKey = env.THIRDWEB_ADMIN_PRIVATE_KEY;
  // Use the key securely
}
```

### If Compromised

1. **Immediately** transfer all assets from the compromised wallet
2. Generate a new wallet and private key
3. Update all environment variables
4. Rotate all API keys
5. Review access logs for suspicious activity

---

## 📝 Logging Security

### Automatic Redaction

Use the secure logger to automatically redact sensitive data:

```typescript
import { logger } from "@/lib/security/logger";

// Safe logging - automatically redacts sensitive data
logger.info("User authenticated", {
  address: "0x123...",
  privateKey: "abc123", // Will be automatically redacted
  token: "Bearer xyz", // Will be automatically redacted
});
```

### Manual Redaction

```typescript
import { redactSensitiveData, safeStringify } from "@/lib/security/sanitize";

const data = {
  user: "john",
  password: "secret123",
  token: "abc",
};

console.log(safeStringify(data));
// Output: { user: 'john', password: '[REDACTED]', token: '[REDACTED]' }
```

---

## 🌐 API Security

### Rate Limiting

Configure rate limiting in `.env.local`:

```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

### Authentication

All protected routes should verify JWT tokens:

```typescript
import { thirdwebAuth } from "@/lib/thirdweb/auth";
import { cookies } from "next/headers";

export async function GET() {
  const jwt = cookies().get("jwt");

  if (!jwt) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });

  if (!authResult.valid) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Proceed with authenticated request
}
```

### CORS

Middleware automatically sets secure headers. Customize in `src/middleware.ts`.

---

## 🔍 Runtime Checks

### Server-Only Functions

```typescript
import { createServerOnlyFunction } from "@/lib/security/runtime-check";

const getSecretData = createServerOnlyFunction(async (userId: string) => {
  // This will throw if called from client
  return await fetchSensitiveData(userId);
}, "getSecretData");
```

### Type Guards

```typescript
import { isServer, isClient } from "@/lib/security/runtime-check";

if (isServer()) {
  // Safe to use server-only code
  const secret = env.THIRDWEB_SECRET_KEY;
}

if (isClient()) {
  // Safe to use browser APIs
  const storage = localStorage.getItem("key");
}
```

---

## 🚨 Security Headers

The following security headers are automatically set via middleware:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy` - Restricts resource loading (production only)
- `Permissions-Policy` - Disables unnecessary browser features

---

## ✅ Security Checklist

### Development

- [ ] `.env.local` is in `.gitignore`
- [ ] Different secrets for dev/staging/prod
- [ ] Environment variables validated on startup
- [ ] No hardcoded secrets in code
- [ ] Sensitive data redacted in logs

### Deployment

- [ ] All environment variables set in hosting platform
- [ ] Production uses strong, unique secrets
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] CSP policy configured
- [ ] Regular security audits scheduled

### Code Review

- [ ] No `NEXT_PUBLIC_` prefix on secrets
- [ ] Server-only functions use `serverOnly()` check
- [ ] API routes validate authentication
- [ ] Sensitive data redacted before logging
- [ ] Error messages don't expose system details

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

## 🆘 Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com

**Do NOT** open a public GitHub issue for security vulnerabilities.

---

## 📜 License & Compliance

- All authentication flows comply with GDPR and CCPA
- User wallet addresses are pseudonymous
- No personal data stored without explicit consent
- Right to deletion honored upon request
