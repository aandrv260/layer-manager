import { render, screen, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/ui/ToastProvider";
import { useToast, type ToastTone } from "@/ui/toast-context";
import LayerProvider from "@/ui/context/LayerProvider";
import { LayerManager } from "@/core/LayerManager";
import { createSilentLogger } from "@/test/helpers";

function Component({ tone = "success" }: { tone?: ToastTone }) {
  const { push } = useToast();
  return (
    <button onClick={() => push({ tone, title: "Saved", message: "All good" })}>
      push
    </button>
  );
}

const renderWithToasts = (ui: ReactNode) =>
  render(
    <LayerProvider layerManager={new LayerManager(createSilentLogger())}>
      <ToastProvider>{ui}</ToastProvider>
    </LayerProvider>,
  );

beforeEach(() => {
  document.body.style.overflow = "";
});

afterEach(() => {
  vi.useRealTimers();
});

test("throws when useToast is used outside a provider", () => {
  function Component() {
    useToast();
    return null;
  }

  vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() => render(<Component />)).toThrow(/within a <ToastProvider>/);
});

test("shows a toast with its title and message when pushed", () => {
  renderWithToasts(<Component />);

  act(() => {
    fireEvent.click(screen.getByText("push"));
  });

  expect(screen.getByText("Saved")).toBeInTheDocument();
  expect(screen.getByText("All good")).toBeInTheDocument();
});

test("stacks multiple toasts", () => {
  renderWithToasts(<Component />);

  act(() => {
    fireEvent.click(screen.getByText("push"));
    fireEvent.click(screen.getByText("push"));
  });

  expect(screen.getAllByText("Saved")).toHaveLength(2);
});

test("applies a tone-specific class", () => {
  renderWithToasts(<Component tone="error" />);

  act(() => {
    fireEvent.click(screen.getByText("push"));
  });

  expect(document.querySelector(".ls-toast--error")).not.toBeNull();
});

test("removes a toast when its dismiss button is clicked", () => {
  renderWithToasts(<Component />);

  act(() => {
    fireEvent.click(screen.getByText("push"));
  });
  expect(screen.getByText("Saved")).toBeInTheDocument();

  act(() => {
    fireEvent.click(screen.getByLabelText("Dismiss notification"));
  });

  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
});

test("auto-dismisses a toast after its timeout", () => {
  vi.useFakeTimers();

  renderWithToasts(<Component />);
  act(() => {
    fireEvent.click(screen.getByText("push"));
  });
  expect(screen.getByText("Saved")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(4000);
  });

  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
});

test("does not lock body scroll because toasts are peripheral", () => {
  renderWithToasts(<Component />);
  act(() => {
    fireEvent.click(screen.getByText("push"));
  });

  expect(screen.getByText("Saved")).toBeInTheDocument();
  expect(document.body.style.overflow).not.toBe("hidden");
});
