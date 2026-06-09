export interface Layer {
  id: string;
  getContainer: () => HTMLElement;

  /**
   * Determines if the layer is toast-like where it doesn't have to lock the body scroll and trap focus.
   */
  peripheral: boolean;
}
