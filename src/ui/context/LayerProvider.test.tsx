import { render, screen } from "@testing-library/react";
import LayerProvider from "@/ui/context/LayerProvider";
import { useLayerManager } from "@/ui/context/useLayerManager";
import { useLayer } from "@/ui/hooks/useLayer";
import { LayerManager } from "@/core/LayerManager";
import { createSilentLogger } from "@/test/helpers";

beforeEach(() => {
  document.body.style.overflow = "";
});

test("provides the LayerManager instance to consumers", () => {
  const manager = new LayerManager(createSilentLogger());
  let received: LayerManager | null = null;

  function Component() {
    received = useLayerManager();
    return null;
  }

  render(
    <LayerProvider layerManager={manager}>
      <Component />
    </LayerProvider>,
  );

  expect(received).toBe(manager);
});

test("throws when useLayerManager is used outside a provider", () => {
  function Component() {
    useLayerManager();
    return null;
  }

  vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() => render(<Component />)).toThrow(/within a <LayerProvider>/);
});

test("initializes focus trapping so an open layer traps Tab", () => {
  function Component() {
    const { containerRef } = useLayer<HTMLDivElement>({
      open: true,
      isPeripheral: false,
    });
    return (
      <div ref={containerRef} tabIndex={-1}>
        <button>first</button>
        <button>last</button>
      </div>
    );
  }

  render(
    <LayerProvider layerManager={new LayerManager(createSilentLogger())}>
      <Component />
    </LayerProvider>,
  );

  screen.getByText("last").focus();
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
  );

  expect(screen.getByText("first")).toHaveFocus();
});

test("cleans up on unmount, restoring body scroll", () => {
  const manager = new LayerManager(createSilentLogger());

  function Component() {
    const { containerRef } = useLayer<HTMLDivElement>({
      open: true,
      isPeripheral: false,
    });
    return <div ref={containerRef} tabIndex={-1} />;
  }

  const { unmount } = render(
    <LayerProvider layerManager={manager}>
      <Component />
    </LayerProvider>,
  );

  expect(document.body.style.overflow).toBe("hidden");

  unmount();

  expect(document.body.style.overflow).toBe("visible");
});
