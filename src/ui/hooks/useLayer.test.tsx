import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useLayer } from "@/ui/hooks/useLayer";
import LayerProvider from "@/ui/context/LayerProvider";
import { LayerManager } from "@/core/LayerManager";
import { createSilentLogger } from "@/test/helpers";

interface ComponentProps {
  open: boolean;
  isPeripheral?: boolean;
}

function Component({ open, isPeripheral = false }: ComponentProps) {
  const { containerRef, layerClassName } = useLayer<HTMLDivElement>({
    open,
    isPeripheral,
  });

  return (
    <div ref={containerRef} role="dialog" aria-label="layer" tabIndex={-1}>
      <p>{layerClassName ?? "none"}</p>
      <button>inside</button>
    </div>
  );
}

const renderInProvider = (ui: ReactNode) =>
  render(
    <LayerProvider layerManager={new LayerManager(createSilentLogger())}>
      {ui}
    </LayerProvider>,
  );

beforeEach(() => {
  document.body.style.overflow = "";
});

test("exposes a z-index class once the layer is open", () => {
  renderInProvider(<Component open />);

  expect(screen.getByText("layer-1")).toBeInTheDocument();
});

test("exposes no z-index class while closed", () => {
  renderInProvider(<Component open={false} />);

  expect(screen.getByText("none")).toBeInTheDocument();
});

test("moves focus into the container when a non-peripheral layer opens", () => {
  renderInProvider(<Component open />);

  expect(screen.getByRole("dialog")).toHaveFocus();
});

test("does not move focus for a peripheral layer", () => {
  renderInProvider(<Component open isPeripheral />);

  expect(screen.getByRole("dialog")).not.toHaveFocus();
});

test("locks body scroll for a non-peripheral layer", () => {
  renderInProvider(<Component open />);

  expect(document.body.style.overflow).toBe("hidden");
});

test("does not lock body scroll for a peripheral layer", () => {
  renderInProvider(<Component open isPeripheral />);

  expect(document.body.style.overflow).not.toBe("hidden");
});

test("pops the layer and restores scroll when it closes", () => {
  const manager = new LayerManager(createSilentLogger());
  const { rerender } = render(
    <LayerProvider layerManager={manager}>
      <Component open />
    </LayerProvider>,
  );

  expect(document.body.style.overflow).toBe("hidden");

  rerender(
    <LayerProvider layerManager={manager}>
      <Component open={false} />
    </LayerProvider>,
  );

  expect(document.body.style.overflow).toBe("visible");
});

test("stacks multiple layers with increasing z-index classes", () => {
  renderInProvider(
    <>
      <Component open />
      <Component open />
    </>,
  );

  expect(screen.getByText("layer-1")).toBeInTheDocument();
  expect(screen.getByText("layer-2")).toBeInTheDocument();
});
