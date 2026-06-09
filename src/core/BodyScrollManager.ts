import { toggleBodyScroll } from "@/utils/scroll.utils";

export class BodyScrollManager {
  private openDialogCount = 0;

  /**
   * Call when a dialog opens
   */
  public lock() {
    this.openDialogCount++;

    if (this.openDialogCount === 1) {
      toggleBodyScroll("hidden");
    }
  }

  /**
   * Call when a dialog closes
   */
  public unlock() {
    const newOpenDialogCount = this.openDialogCount - 1;
    this.openDialogCount = Math.max(0, newOpenDialogCount);

    if (this.openDialogCount === 0) {
      toggleBodyScroll("visible");
    }
  }

  /**
   * Get current count (useful for debugging and tests)
   */
  public getCount() {
    return this.openDialogCount;
  }

  public reset() {
    const currentOpenDialogCount = this.openDialogCount;

    if (currentOpenDialogCount > 0) {
      toggleBodyScroll("visible");
    }

    this.openDialogCount = 0;
  }
}
