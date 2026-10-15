import { render, screen, fireEvent, act } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { Dialog } from "@/ui/Dialog";
import LayerProvider from "@/ui/context/LayerProvider";
import { LayerManager } from "@/core/LayerManager";
import { createSilentLogger } from "@/test/helpers";

const renderDialog = (ui: ReactNode) =>
  render(
    <LayerProvider layerManager={new LayerManager(createSilentLogger())}>
      {ui}
    </LayerProvider>,
  );

beforeEach(() => {
  document.body.style.overflow = "";
});

test("renders nothing while closed", () => {
  renderDialog(
    <Dialog open={false} onClose={() => {}} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("renders the title, badge and content when open", () => {
  renderDialog(
    <Dialog open onClose={() => {}} title="Settings" badge="LAYER 1">
      <p>body content</p>
    </Dialog>,
  );

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(screen.getByText("LAYER 1")).toBeInTheDocument();
  expect(screen.getByText("body content")).toBeInTheDocument();
});

test("calls onClose when Escape is pressed", () => {
  const onClose = vi.fn();
  renderDialog(
    <Dialog open onClose={onClose} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  act(() => {
    fireEvent.keyDown(document, { key: "Escape" });
  });

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("calls onClose when the close button is clicked", () => {
  const onClose = vi.fn();
  renderDialog(
    <Dialog open onClose={onClose} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  act(() => {
    fireEvent.click(screen.getByLabelText("Close dialog"));
  });

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("calls onClose when the overlay behind the dialog is clicked", () => {
  const onClose = vi.fn();
  renderDialog(
    <Dialog open onClose={onClose} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  const overlay = screen.getByRole("dialog").parentElement;
  act(() => {
    fireEvent.mouseDown(overlay as HTMLElement);
  });

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not call onClose when the dialog surface itself is clicked", () => {
  const onClose = vi.fn();
  renderDialog(
    <Dialog open onClose={onClose} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  act(() => {
    fireEvent.mouseDown(screen.getByRole("dialog"));
  });

  expect(onClose).not.toHaveBeenCalled();
});

test("locks body scroll while open", () => {
  renderDialog(
    <Dialog open onClose={() => {}} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  expect(document.body.style.overflow).toBe("hidden");
});

test("applies the stacking z-index class to the overlay", () => {
  renderDialog(
    <Dialog open onClose={() => {}} title="Settings">
      <p>body</p>
    </Dialog>,
  );

  const overlay = screen.getByRole("dialog").parentElement;
  expect(overlay?.className).toContain("layer-1");
});

test("renders footer content", () => {
  renderDialog(
    <Dialog
      open
      onClose={() => {}}
      title="Settings"
      footer={<button>Save</button>}
    >
      <p>body</p>
    </Dialog>,
  );

  expect(screen.getByText("Save")).toBeInTheDocument();
});

test("Escape closes only the topmost of nested dialogs", () => {
  const onCloseRoot = vi.fn();
  const onCloseNested = vi.fn();
  renderDialog(
    <>
      <Dialog open onClose={onCloseRoot} title="Root">
        <p>root</p>
      </Dialog>
      <Dialog open onClose={onCloseNested} title="Nested">
        <p>nested</p>
      </Dialog>
    </>,
  );

  act(() => {
    fireEvent.keyDown(document, { key: "Escape" });
  });

  expect(onCloseNested).toHaveBeenCalledTimes(1);
  expect(onCloseRoot).not.toHaveBeenCalled();
});

test("Escape reaches the dialog beneath once the top one has closed", () => {
  function Nested({ onCloseRoot }: { onCloseRoot: () => void }) {
    const [nestedOpen, setNestedOpen] = useState(true);
    return (
      <>
        <Dialog open onClose={onCloseRoot} title="Root">
          <p>root</p>
        </Dialog>
        <Dialog open={nestedOpen} onClose={() => setNestedOpen(false)} title="Nested">
          <p>nested</p>
        </Dialog>
      </>
    );
  }

  const onCloseRoot = vi.fn();
  renderDialog(<Nested onCloseRoot={onCloseRoot} />);

  act(() => {
    fireEvent.keyDown(document, { key: "Escape" });
  });

  expect(screen.queryByRole("dialog", { name: "Nested" })).not.toBeInTheDocument();
  expect(onCloseRoot).not.toHaveBeenCalled();

  act(() => {
    fireEvent.keyDown(document, { key: "Escape" });
  });

  expect(onCloseRoot).toHaveBeenCalledTimes(1);
});
