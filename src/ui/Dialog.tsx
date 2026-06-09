import { createPortal } from "react-dom";
import { useEffect } from "react";
import { useLayer } from "@/ui/hooks/useLayer";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Short monospace tag shown in the header, e.g. "LAYER" or "NESTED". */
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Accessible modal dialog built on top of `useLayer`. Each open Dialog pushes a
 * non-peripheral layer onto the stack - locking body scroll, trapping focus, and
 * receiving an auto-incrementing `layer-N` z-index class.
 */
export function Dialog({ open, onClose, title, badge, children, footer }: DialogProps) {
  const { containerRef, layerClassName } = useLayer<HTMLDivElement>({
    open,
    isPeripheral: false,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className={`ls-overlay ${layerClassName ?? ""}`}
      onMouseDown={onClose}
    >
      <div
        ref={containerRef}
        className="ls-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="ls-dialog__head">
          <div className="ls-dialog__title">
            {badge && <span className="ls-chip">{badge}</span>}
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="ls-iconbtn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="ls-dialog__body">{children}</div>

        {footer && <footer className="ls-dialog__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
