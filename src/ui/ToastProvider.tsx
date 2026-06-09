import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLayer } from "@/ui/hooks/useLayer";
import type { PropsWithChildrenRequired } from "@/types/react.types";
import {
  ToastContext,
  type Toast,
  type ToastApi,
  type ToastTone,
} from "@/ui/toast-context";

const TONE_GLYPH: Record<ToastTone, string> = {
  info: "›",
  success: "✓",
  warn: "!",
  error: "✕",
};

export function ToastProvider({ children }: PropsWithChildrenRequired) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
    timers.current.delete(id);
  }, []);

  const push = useCallback<ToastApi["push"]>(
    toast => {
      const id = crypto.randomUUID();
      setToasts(current => [...current, { ...toast, id }]);

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 4000),
      );
    },
    [dismiss],
  );

  const api = useMemo(() => ({ push }), [push]);

  const { containerRef, layerClassName } = useLayer<HTMLDivElement>({
    open: toasts.length > 0,
    isPeripheral: true,
  });

  return (
    <ToastContext value={api}>
      {children}
      {toasts.length > 0 &&
        createPortal(
          <div
            ref={containerRef}
            className={`ls-toasts ${layerClassName ?? ""}`}
            role="region"
            aria-label="Notifications"
          >
            {toasts.map(toast => (
              <div key={toast.id} className={`ls-toast ls-toast--${toast.tone}`}>
                <span className="ls-toast__glyph">{TONE_GLYPH[toast.tone]}</span>
                <div className="ls-toast__content">
                  <strong>{toast.title}</strong>
                  {toast.message && <p>{toast.message}</p>}
                </div>
                <button
                  type="button"
                  className="ls-iconbtn ls-iconbtn--sm"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(toast.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext>
  );
}
