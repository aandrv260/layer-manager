# Layer Manager

A small engine for stacking modals, dialogs, toasts, etc. in web apps, with a React hook on top.

## The problem

Overlays start simple.
You render a modal, set `overflow: hidden` on the body, and it works.

Then the app grows.
A confirm dialog opens on top of a settings modal, and closing the confirm unlocks the page while settings is still open.

Tab walks straight out of the dialog into links and buttons you can't even see.
Escape closes both dialogs at once, and when they close, focus drops to `body` so a keyboard user starts over from the top of the page.

Every overlay ends up with its own scroll lock, its own focus trap and its own hardcoded z-index.
They don't know about each other, so they collide.

## What this does instead

There is one `LayerManager` for the whole app, and every overlay registers with it as a layer.
It keeps all of them in a single stack, so it always knows which one is on top.

A few things are handled for you:

- Body scroll locks when the first modal opens and unlocks only when the last one closes.
- Tab and Shift+Tab cycle inside the topmost modal and never leave it.
- When a modal closes, the trap moves to the one beneath it, and focus goes back to whatever opened it.
- Each layer can check whether it's on top, so Escape only closes the topmost one.
- Each layer gets a `layer-N` class from its stack position, so z-index follows the order things opened in.
- Layers can be peripheral, like toasts, so they join the stack without locking scroll or stealing focus.

## Why the core has no React in it

`LayerManager` doesn't know React exists.
React only gets a thin layer on top, made of a provider and a `useLayer` hook.

That was a deliberate choice.
Stacking, scroll locking and focus trapping have nothing to do with how you render, so the same manager can sit under Vue, Svelte, Angular or plain TypeScript.

It also keeps the tricky logic testable on its own, without mounting a single component.
The core still talks to the DOM for focus and scroll, so it's browser-only for now, but that's [changing](#where-its-going).

## Where it's going

Right now the focus trap and the scroll lock are written for the browser.
That, plus the CSS class names, is what keeps the core on the web.

The plan is to turn both into interfaces, `FocusTrap` and `ScrollLock`, and pass them into the manager through the constructor.
The web gets its own classes that implement them, and so does React Native.

The library would then export `LayerManager` from a web module and `MobileLayerManager` from a mobile module.
Both share the same stack logic underneath.

The core will also stop handing out CSS class names.
It will return each layer's position in the stack, and each platform turns that into a class or a `zIndex` style.

## Examples

### Getting started in React

Create one manager for the app and pass it to the provider.
The provider attaches the focus trap listener on mount and tears everything down on unmount.

```tsx
import { LayerManager } from "@/core/LayerManager";
import LayerProvider from "@/ui/context/LayerProvider";
import { ConsoleLogger } from "@/utils/ConsoleLogger";

const layerManager = new LayerManager(new ConsoleLogger());

createRoot(document.getElementById("root")!).render(
  <LayerProvider layerManager={layerManager}>
    <App />
  </LayerProvider>,
);
```

The manager takes any logger that implements `ILogger`, so you can swap the console for your own sink.
You also define the z-index for each `layer-N` class yourself, so it fits whatever scale your app already uses.

```css
.layer-1 {
  z-index: 1000;
}
.layer-2 {
  z-index: 1010;
}
.layer-3 {
  z-index: 1020;
}
```

### A modal

Register a layer from any component with `useLayer`.

```tsx
import { useLayer } from "@/ui/hooks/useLayer";

function Modal({ open, onClose, children }: ModalProps) {
  const { containerRef, layerClassName, isActive } = useLayer<HTMLDivElement>({
    open,
    isPeripheral: false,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isActive()) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isActive]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      className={`modal ${layerClassName ?? ""}`}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>,
    document.body,
  );
}
```

The container gets focus when the layer opens, which is why it needs `tabIndex={-1}`.
Pass `initialFocusedElementRef` if you want a specific element focused instead.

Every open modal hears the same Escape keypress.
`isActive()` tells you whether this layer is the topmost one, so only that one closes.

### Layers on top of layers

Open a second modal from inside the first, and it sits one layer higher with Tab trapped inside it.
When it closes, the trap moves back down and focus returns to the button that opened it.

The page stays locked the whole time.
It only scrolls again once the last modal closes.

### A peripheral layer

```tsx
function Toast({ open, message }: { open: boolean; message: string }) {
  const { containerRef, layerClassName } = useLayer<HTMLDivElement>({
    open,
    isPeripheral: true,
  });

  if (!open) {
    return null;
  }

  return createPortal(
    <div ref={containerRef} className={`toast ${layerClassName ?? ""}`} role="status">
      {message}
    </div>,
    document.body,
  );
}
```

A peripheral layer still gets a `layer-N` class, but it never locks scroll, traps focus or moves focus.
It's up to you whether that's one layer per toast or one for a whole notification area.

### Without React

```ts
import { LayerManager } from "@/core/LayerManager";
import { ConsoleLogger } from "@/utils/ConsoleLogger";

const layerManager = new LayerManager(new ConsoleLogger());
layerManager.init();

const panel = document.querySelector<HTMLElement>("#filters")!;
const layerId = crypto.randomUUID();

layerManager.addLayer({
  id: layerId,
  peripheral: false,
  getContainer: () => panel,
});

panel.classList.add(layerManager.getZIndexClassNameById(layerId)!);
```

When the panel closes, pop it, and call `cleanup` once you don't need the manager anymore.

```ts
layerManager.popLayer(layerId);
layerManager.cleanup();
```

Moving focus into the layer and back out is done by the React hook.
Outside React, that part is up to you.

## What happens when a layer closes

1. The layer is removed from the stack.
2. If it was a modal, the scroll lock count drops, and the page scrolls again once it reaches zero.
3. The focus trap moves to the topmost modal that's left, skipping any toasts.
4. If no modal is left, the trap is released and Tab works normally on the page again.
5. The React hook moves focus back to the element that had it before the layer opened.

## Known limitations

- A layer's `layer-N` class is set when it opens, so it doesn't shift down if a layer below it closes first.
- Unlocking scroll sets `overflow: visible` instead of restoring the value the page had before.

Neither one shows up when overlays close in the usual top-down order.
Both are next on my list.
