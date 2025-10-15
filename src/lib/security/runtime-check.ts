/**
 * Runtime Security Checks
 *
 * These functions help ensure that sensitive data never leaks to the client
 */

/**
 * Throws an error if called from client-side code
 */
export function serverOnly(functionName: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `${functionName} can only be called on the server. ` +
        `This function contains sensitive data and must not be exposed to the client.`
    );
  }
}

/**
 * Throws an error if called from server-side code
 */
export function clientOnly(functionName: string): void {
  if (typeof window === "undefined") {
    throw new Error(`${functionName} can only be called on the client.`);
  }
}

/**
 * Wrapper to ensure a function only runs on the server
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServerOnlyFunction<T extends (...args: any[]) => any>(
  fn: T,
  functionName?: string
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    serverOnly(functionName || fn.name || "This function");
    return fn(...args) as ReturnType<T>;
  }) as T;
}

/**
 * Checks if the current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Checks if the current environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Only runs the callback in development mode
 */
export function devOnly(callback: () => void): void {
  if (isDevelopment()) {
    callback();
  }
}

/**
 * Asserts that a value is defined, throws otherwise
 */
export function assertDefined<T>(
  value: T | undefined | null,
  message: string
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}

/**
 * Type guard to check if we're on the server
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Type guard to check if we're on the client
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}
