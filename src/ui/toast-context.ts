import { createContext, useContext } from "react";

export type ToastTone = "info" | "success" | "warn" | "error";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  tone: ToastTone;
}

export interface ToastApi {
  push: (toast: Omit<Toast, "id">) => void;
}

export const ToastContext = createContext<ToastApi | undefined>(undefined);

/**
 * Access the toast dispatcher. Must be rendered under `<ToastProvider>`.
 */
export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>.");
  }

  return context;
};
