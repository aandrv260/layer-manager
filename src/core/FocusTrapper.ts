import { getFocusable } from "@/utils/focus.utils";

export class FocusTrapper {
  private container: HTMLElement | null = null;
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !this.container) {
      return;
    }

    const { focusableElements, first, last } = getFocusable(this.container);

    if (focusableElements.length === 0) {
      return;
    }

    if (!focusableElements.includes(document.activeElement as HTMLElement)) {
      this.container.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
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
