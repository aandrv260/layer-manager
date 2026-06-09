# layer-system

A small headless engine for stacking UI overlays (modals, dialogs, toasts) on top of a single, shared layer stack.

## The problem

When more than one overlay is open at a time, three things get hard to coordinate:

- **Stacking order:** which overlay sits on top of which.
- **Body scroll:** the page behind a modal should not scroll, and it must stay locked until the last modal closes (not the first).
- **Focus:** keyboard focus should be trapped inside the topmost modal and returned to the one beneath it when that modal closes.

Handled per-component, this logic gets duplicated and drifts out of sync.

## What it does

A single `LayerManager` owns one stack and centralizes all three concerns:

- Hands out an incrementing `layer-N` z-index class per open layer.
- Reference-counts the body-scroll lock, so nested overlays release it correctly.
- Traps Tab / Shift+Tab focus inside the active layer.

Layers can be **peripheral** (toast-like: no scroll lock, no focus trap) or normal (modal-like).

The core is plain TypeScript with no React or DOM-framework assumptions; the React binding is a thin layer on top.

## Usage

Mount one manager at the root:

```tsx
const layerManager = new LayerManager(new ConsoleLogger());

<LayerProvider layerManager={layerManager}>
  <App />
</LayerProvider>
```

Then register a layer from any component with the `useLayer` hook (or use the ready-made `Dialog` and `ToastProvider` built on it):

```tsx
const { containerRef, layerClassName } = useLayer({ open, isPeripheral: false });
```

## Layout

```
src/
  core/      LayerManager, FocusTrapper, BodyScrollManager
  hooks/     useLayer (under ui/)
  context/   LayerProvider, useLayerManager (under ui/)
  ui/        Dialog, ToastProvider
  types/     Layer, ILogger
  utils/     focus + scroll helpers, ConsoleLogger
```

## Scripts

```
pnpm dev     # run the demo
pnpm test    # run the test suite
pnpm build   # typecheck + production build
```
