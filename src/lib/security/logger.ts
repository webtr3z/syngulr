/**
 * Secure Logger
 *
 * Automatically redacts sensitive information from logs
 */

import { redactSensitiveData, safeStringify } from "./sanitize";
import { env } from "@/lib/env";

type LogLevel = "debug" | "info" | "warn" | "error";

class SecureLogger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel =
      typeof window === "undefined" ? (env.LOG_LEVEL as LogLevel) : "info";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (data) {
      const safeData = safeStringify(data);
      return `${prefix} ${message}\n${safeData}`;
    }

    return `${prefix} ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, data));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog("error")) {
      const errorData =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error;

      console.error(
        this.formatMessage("error", message, redactSensitiveData(errorData))
      );
    }
  }

  /**
   * Use this for security-sensitive operations
   * Automatically redacts all data
   */
  secure(level: LogLevel, message: string, data?: unknown): void {
    if (this.shouldLog(level)) {
      const redacted = redactSensitiveData(data);
      const formatted = this.formatMessage(level, message, redacted);

      switch (level) {
        case "debug":
          console.debug(formatted);
          break;
        case "info":
          console.info(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "error":
          console.error(formatted);
          break;
      }
    }
  }
}

export const logger = new SecureLogger();
