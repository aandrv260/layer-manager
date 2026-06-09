import { useState } from "react";
import { Dialog } from "@/ui/Dialog";
import { useToast, type ToastTone } from "@/ui/toast-context";
import "@/demo/demo.css";

export default function DemoPage() {
  const toast = useToast();
  const [level1, setLevel1] = useState(false);
  const [level2, setLevel2] = useState(false);
  const [level3, setLevel3] = useState(false);

  const stack = [
    level1 && "Dialog · root",
    level2 && "Dialog · nested",
    level3 && "Dialog · deep",
  ].filter(Boolean) as string[];

  const scrollLocked = stack.length > 0;

  const fire = (tone: ToastTone) =>
    toast.push({
      tone,
      title: `${tone.toUpperCase()} event dispatched`,
      message: "Peripheral layer - no scroll lock, no focus trap.",
    });

  return (
    <div className="ls-shell">
      <header className="ls-topbar">
        <div className="ls-brand">
          <span className="ls-brand__mark">L</span>
          <div>
            layer-system
            <small>stack · focus · scroll</small>
          </div>
        </div>
        <div className="ls-topbar__meta">
          <span>react <b>19</b></span>
          <span>deps <b>0</b></span>
          <span>a11y <b>focus-trap</b></span>
        </div>
      </header>

      <section className="ls-hero">
        <span className="ls-tag">layer orchestration primitive</span>
        <h1>
          Stack overlays<br />
          <span className="grad">without the chaos.</span>
        </h1>
        <p>
          A headless layering engine for modals, dialogs and toasts. It manages a
          single z-index stack, locks body scroll with reference counting, and
          traps keyboard focus inside the topmost layer - all decoupled behind a
          one-line hook.
        </p>
        <div className="ls-hero__actions">
          <button className="ls-btn ls-btn--primary" onClick={() => setLevel1(true)}>
            Open a layer →
          </button>
          <button className="ls-btn ls-btn--ghost" onClick={() => fire("success")}>
            Fire a toast
          </button>
        </div>
      </section>

      <section className="ls-section">
        <span className="ls-section__label">Playground</span>
        <h2>Drive the stack live</h2>
        <p>
          Open nested modals to watch the z-index climb, then fire peripheral
          toasts that coexist without stealing focus.
        </p>

        <div className="ls-play">
          <div className="ls-panel">
            <div className="ls-panel__title">controls</div>
            <div className="ls-actions-col">
              <button className="ls-btn ls-btn--primary" onClick={() => setLevel1(true)}>
                Open modal (non-peripheral)
              </button>
              <button className="ls-btn" onClick={() => fire("info")}>
                Toast · info
              </button>
              <button className="ls-btn" onClick={() => fire("success")}>
                Toast · success
              </button>
              <button className="ls-btn" onClick={() => fire("warn")}>
                Toast · warn
              </button>
              <button className="ls-btn" onClick={() => fire("error")}>
                Toast · error
              </button>
            </div>
          </div>

          <div className="ls-panel">
            <div className="ls-panel__title">live monitor</div>
            <div className="ls-monitor">
              <div className="ls-stat">
                <span>modal layers</span>
                <b>{stack.length}</b>
              </div>
              <div className="ls-stat">
                <span>body scroll</span>
                <b className={scrollLocked ? "" : "off"}>
                  {scrollLocked ? "LOCKED" : "free"}
                </b>
              </div>
              <div className="ls-stat">
                <span>focus trap</span>
                <b className={scrollLocked ? "" : "off"}>
                  {scrollLocked ? "active" : "idle"}
                </b>
              </div>

              <div className="ls-stack">
                {stack.length === 0 ? (
                  <div className="ls-stack__empty">stack is empty</div>
                ) : (
                  stack.map((label, index) => (
                    <div className="ls-stack__item" key={label}>
                      <span>{label}</span>
                      <span>layer-{index + 1}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="ls-foot">
        <span>esc to close · tab to cycle · click outside to dismiss</span>
      </footer>

      <Dialog
        open={level1}
        onClose={() => setLevel1(false)}
        title="Root layer"
        badge="LAYER 1"
        footer={
          <>
            <button className="ls-btn ls-btn--ghost" onClick={() => setLevel1(false)}>
              Close
            </button>
            <button className="ls-btn ls-btn--primary" onClick={() => setLevel2(true)}>
              Open nested layer →
            </button>
          </>
        }
      >
        <p>
          This dialog registered itself via <code>useLayer()</code> with{" "}
          <code>isPeripheral: false</code>. Body scroll is now locked and focus is
          trapped inside.
        </p>
        <p>
          Press <code>Tab</code> to cycle focusable elements, <code>Esc</code> to
          close, or open a nested layer to push it higher on the stack.
        </p>
      </Dialog>

      <Dialog
        open={level2}
        onClose={() => setLevel2(false)}
        title="Nested layer"
        badge="LAYER 2"
        footer={
          <>
            <button className="ls-btn ls-btn--ghost" onClick={() => setLevel2(false)}>
              Back
            </button>
            <button className="ls-btn ls-btn--primary" onClick={() => setLevel3(true)}>
              Go deeper →
            </button>
          </>
        }
      >
        <p>
          A second layer sits on top with a higher <code>layer-N</code> z-index
          class. The scroll-lock counter is now <code>2</code> - closing this one
          keeps the background locked until the root closes too.
        </p>
      </Dialog>

      <Dialog
        open={level3}
        onClose={() => setLevel3(false)}
        title="Deep layer"
        badge="LAYER 3"
        footer={
          <button className="ls-btn ls-btn--primary" onClick={() => setLevel3(false)}>
            Pop this layer
          </button>
        }
      >
        <p>
          Three layers deep. Focus is trapped in <em>this</em> container; when it
          closes, the trap automatically returns to the layer beneath it.
        </p>
      </Dialog>
    </div>
  );
}
