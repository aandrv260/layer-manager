import type { ILogger } from "@/types/ILogger";

export const createSilentLogger = (): ILogger => ({
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
});

export interface LogRecord {
  level: "debug" | "info" | "warn" | "error";
  message: string;
}

export const createRecordingLogger = () => {
  const records: LogRecord[] = [];
  const logger: ILogger = {
    debug: message => records.push({ level: "debug", message }),
    info: message => records.push({ level: "info", message }),
    warn: message => records.push({ level: "warn", message }),
    error: message => records.push({ level: "error", message }),
  };
  return { logger, records };
};
