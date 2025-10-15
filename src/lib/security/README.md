# Security Utilities

This directory contains security utilities for protecting sensitive data in Syngulr.

## Modules

### `sanitize.ts`

- **redactSensitiveData()**: Automatically redacts private keys, tokens, and passwords
- **maskAddress()**: Formats wallet addresses for display (0x1234...5678)
- **ensureNoSecrets()**: Validates that no secrets are being sent to client
- **safeStringify()**: JSON.stringify with automatic redaction

### `runtime-check.ts`

- **serverOnly()**: Ensures function only runs on server
- **clientOnly()**: Ensures function only runs on client
- **createServerOnlyFunction()**: Wraps functions with server-only check
- **isProduction()**, **isDevelopment()**: Environment checks
- **assertDefined()**: Type-safe assertion helper

### `logger.ts`

- **logger**: Secure logger that automatically redacts sensitive data
- Methods: `debug()`, `info()`, `warn()`, `error()`, `secure()`

## Usage Examples

### Safe Logging

```typescript
import { logger } from "@/lib/security/logger";

// Automatically redacts sensitive data
logger.info("User login", {
  address: "0x123...",
  privateKey: "secret", // Will be redacted
  balance: 1000,
});
```

### Server-Only Functions

```typescript
import { serverOnly } from "@/lib/security/runtime-check";

async function getPrivateData() {
  serverOnly("getPrivateData");

  // Safe to use server secrets here
  const secret = env.THIRDWEB_SECRET_KEY;
  return await fetchData(secret);
}
```

### Sanitizing Output

```typescript
import { redactSensitiveData } from "@/lib/security/sanitize";

const data = {
  user: "alice",
  token: "abc123",
  apiKey: "secret",
};

const safe = redactSensitiveData(data);
// { user: 'alice', token: '[REDACTED]', apiKey: '[REDACTED]' }
```

### Display Wallet Addresses

```typescript
import { maskAddress } from "@/lib/security/sanitize";

const address = "0x1234567890123456789012345678901234567890";
const masked = maskAddress(address);
// '0x1234...7890'
```

## Best Practices

1. **Always use the logger** for any logging that might contain user data
2. **Use serverOnly()** for any function accessing server secrets
3. **Never log raw private keys or tokens**
4. **Validate all environment variables** before use
5. **Use maskAddress()** when displaying wallet addresses to users
