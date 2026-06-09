import { getFocusable } from "@/utils/focus.utils";

export class FocusTrapper {
  private container: HTMLElement | null = null;
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !this.container) {
      return;
    }

    const { focusableElements, first, last } = getFocusable(this.container);

    if (focusableElements.length === 0) {
      // Nothing tabbable inside; keep focus pinned to the container.
      event.preventDefault();
      this.container.focus();
      return;
    }

    const active = document.activeElement as HTMLElement;

    // Focus is outside the trapped set - e.g. on the container itself right
    // after the layer opens. Don't fall through to native Tab handling (which
    // would let Shift+Tab walk focus out of the layer); pull it to the edge
    // matching the direction instead.
    if (!focusableElements.includes(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  public trap(container: HTMLElement) {
    this.container = container;
  }

  public init() {
    document.addEventListener("keydown", this.onKeyDown);
  }

  public cleanup() {
    this.container = null;
    document.removeEventListener("keydown", this.onKeyDown);
  }
}
