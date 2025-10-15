# 🔐 Environment Variables Setup Guide

This guide explains how to securely set up and manage environment variables in Syngulr.

## 📋 Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values** (see sections below)

3. **Never commit `.env.local`** (already in `.gitignore`)

---

## 🔑 Required Variables

### Thirdweb Configuration

Get these from [thirdweb.com](https://thirdweb.com):

```env
# Public - Client ID from thirdweb dashboard
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Secret - API Secret Key (NEVER expose to client)
THIRDWEB_SECRET_KEY=your_secret_key_here

# Secret - Admin wallet private key (NEVER expose to client)
THIRDWEB_ADMIN_PRIVATE_KEY=your_private_key_here
```

**How to get these:**

1. Go to https://thirdweb.com/dashboard
2. Create a new project
3. Copy the Client ID (safe for client-side)
4. Generate and copy the Secret Key (server-side only)
5. Export your admin wallet's private key from MetaMask (server-side only)

### NFT Contract Configuration

```env
# Public - Your NFT contract address
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Public - Blockchain chain ID
NEXT_PUBLIC_CHAIN_ID=1  # 1 = Ethereum, 137 = Polygon, etc.

# Public - Your app domain
NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN=localhost:3000  # Change in production
```

---

## 🛡️ Security Best Practices

### ✅ DO:

- **Keep `.env.local` out of version control** (already in `.gitignore`)
- **Use different values for dev/staging/production**
- **Rotate secrets regularly**
- **Use strong, random values for secrets**
- **Prefix public variables with `NEXT_PUBLIC_`**
- **Store production secrets in your hosting platform** (Vercel, Railway, etc.)

### ❌ DON'T:

- **Never commit `.env.local` to git**
- **Never share private keys**
- **Never prefix secrets with `NEXT_PUBLIC_`**
- **Never hardcode secrets in code**
- **Never log sensitive values**
- **Never expose admin private keys to the client**

---

## 🔍 Variable Types

### Public Variables (Client-Side)

Prefixed with `NEXT_PUBLIC_` - These are **safe to expose** to the browser:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=...
NEXT_PUBLIC_CHAIN_ID=...
```

### Private Variables (Server-Side)

**NO** `NEXT_PUBLIC_` prefix - These are **NEVER exposed** to the browser:

```env
THIRDWEB_SECRET_KEY=...
THIRDWEB_ADMIN_PRIVATE_KEY=...
NOTION_API_KEY=...
```

---

## 📝 How to Use in Code

### Server-Side (API Routes, Server Components)

```typescript
import { env } from "@/lib/env";

// ✅ Safe - only accessible on server
const secretKey = env.THIRDWEB_SECRET_KEY;
const privateKey = env.THIRDWEB_ADMIN_PRIVATE_KEY;
```

### Client-Side (Client Components, Browser)

```typescript
import { clientEnv } from "@/lib/env";

// ✅ Safe - only public variables
const clientId = clientEnv.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const contractAddress = clientEnv.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

// ❌ ERROR - Cannot access server secrets on client
// const secretKey = env.THIRDWEB_SECRET_KEY; // This will throw an error
```

---

## 🚀 Deployment

### Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable from `.env.local`
4. Set the appropriate environment (Production/Preview/Development)

### Railway / Render / Other Platforms

1. Access environment variables settings
2. Add all variables from `.env.local`
3. Ensure production values are different from development

---

## 🔧 Validation

The app automatically validates all environment variables on startup:

```bash
pnpm dev  # Will validate env vars before starting
```

If validation fails, you'll see clear error messages:

```
❌ Invalid server environment variables:
  THIRDWEB_SECRET_KEY: Required
  THIRDWEB_ADMIN_PRIVATE_KEY: Required
```

---

## 🆘 Troubleshooting

### "Environment variables not found"

- Make sure you've created `.env.local`
- Check that variable names match exactly (case-sensitive)
- Restart your dev server after changing `.env.local`

### "Cannot access server variables on client"

- You're trying to use a server-only variable in a client component
- Use `clientEnv` instead of `env` for client components
- Or move the logic to a server component or API route

### "Invalid Ethereum address"

- Contract addresses must start with `0x`
- Must be exactly 42 characters (0x + 40 hex chars)
- Example: `0x1234567890123456789012345678901234567890`

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Thirdweb Authentication](https://portal.thirdweb.com/auth)
- [Ethereum Private Key Security](https://support.metamask.io/privacy-and-security/how-to-reveal-your-secret-recovery-phrase/)

---

## ⚠️ Emergency: Private Key Leaked

If you accidentally expose a private key:

1. **Immediately** transfer all funds from that wallet
2. **Generate a new wallet** and private key
3. **Update** environment variables
4. **Rotate** all API keys
5. **Review** git history and remove sensitive data
6. Consider using tools like [git-filter-repo](https://github.com/newren/git-filter-repo)
