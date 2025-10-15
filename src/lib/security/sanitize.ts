/**
 * Security Utilities for Sanitizing and Protecting Sensitive Data
 */

/**
 * Redacts sensitive information from logs and error messages
 */
export function redactSensitiveData(data: unknown): unknown {
  if (typeof data === "string") {
    return redactString(data);
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === "object" && data !== null) {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveKey(key)) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Checks if a key name suggests sensitive data
 */
function isSensitiveKey(key: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /auth/i,
    /credential/i,
    /jwt/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(key));
}

/**
 * Redacts private keys, tokens, and other sensitive strings
 */
function redactString(str: string): string {
  // Redact Ethereum private keys (64 hex chars, may have 0x prefix)
  str = str.replace(/0x[a-fA-F0-9]{64}/g, "0x[REDACTED_PRIVATE_KEY]");
  str = str.replace(/\b[a-fA-F0-9]{64}\b/g, "[REDACTED_PRIVATE_KEY]");

  // Redact JWT tokens
  str = str.replace(
    /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    "[REDACTED_JWT]"
  );

  // Redact API keys (common patterns)
  str = str.replace(/sk_[a-zA-Z0-9]{32,}/g, "[REDACTED_SECRET_KEY]");
  str = str.replace(/pk_[a-zA-Z0-9]{32,}/g, "[REDACTED_PUBLIC_KEY]");

  return str;
}

/**
 * Masks wallet addresses for display (shows first 6 and last 4 chars)
 */
export function maskAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validates that no secrets are being sent to the client
 */
export function ensureNoSecrets(obj: Record<string, unknown>): void {
  const secrets = Object.keys(obj).filter(isSensitiveKey);

  if (secrets.length > 0) {
    throw new Error(
      `Attempted to send sensitive data to client: ${secrets.join(", ")}`
    );
  }
}

/**
 * Safe JSON stringify that redacts sensitive data
 */
export function safeStringify(data: unknown): string {
  return JSON.stringify(redactSensitiveData(data), null, 2);
}

/**
 * Validates Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates private key format (without exposing the key)
 */
export function isValidPrivateKey(key: string): boolean {
  // Check format without logging the actual key
  const withoutPrefix = key.startsWith("0x") ? key.slice(2) : key;
  return /^[a-fA-F0-9]{64}$/.test(withoutPrefix);
}
