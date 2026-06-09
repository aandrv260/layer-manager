/**
 * Minimal logging contract consumed by the layering system. Swap in any
 * implementation (console, remote sink, no-op) without touching the core.
 */
export interface ILogger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}
