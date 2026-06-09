import type { ILogger } from "@/types/ILogger";

/**
 * Default `ILogger` implementation that writes to the browser console.
 * Replace with your own sink in production apps.
 */
export class ConsoleLogger implements ILogger {
  constructor(private readonly prefix = "[layers]") {}

  public debug(message: string, ...args: unknown[]) {
    console.debug(`${this.prefix} ${message}`, ...args);
  }

  public info(message: string, ...args: unknown[]) {
    console.info(`${this.prefix} ${message}`, ...args);
  }

  public warn(message: string, ...args: unknown[]) {
    console.warn(`${this.prefix} ${message}`, ...args);
  }

  public error(message: string, ...args: unknown[]) {
    console.error(`${this.prefix} ${message}`, ...args);
  }
}
