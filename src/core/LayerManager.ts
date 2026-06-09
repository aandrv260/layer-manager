import type { Layer } from "@/types/Layer";
import { BodyScrollManager } from "@/core/BodyScrollManager";
import { FocusTrapper } from "@/core/FocusTrapper";
import type { ILogger } from "@/types/ILogger";
import { getFirstFocusableElement } from "@/utils/focus.utils";

// TODO: Make the layer manager itself pure (to not know about the DOM) and create adaptation for the DOM and React Native.
// Currently, it knows about the DOM indirectly throught the body scroll manager and the focus trapper which is fine for now.
export class LayerManager {
  private layerStack: Layer[] = [];
  private readonly bodyScrollManager = new BodyScrollManager();
  private readonly focusTrapper = new FocusTrapper();

  constructor(private readonly logger: ILogger) {}

  public getFirstFocusableElementForLayer(layerId: string): HTMLElement | null {
    const layer = this.findLayer(layerId);

    if (!layer) {
      this.logger.warn(`Layer not found with ID ${layerId}`);
      return null;
    }

    return getFirstFocusableElement(layer.getContainer());
  }

  public findLayer(layerId: string): Layer | null {
    const layer = this.layerStack.find((el) => el.id === layerId);

    if (!layer) {
      return null;
    }

    return layer;
  }

  public hasId(id: string) {
    return this.layerStack.some((layer) => layer.id === id);
  }

  public addLayer(layer: Layer) {
    this.layerStack.push(layer);

    if (!layer.peripheral) {
      this.bodyScrollManager.lock();
      this.focusTrapper.trap(layer.getContainer());
    }
  }

  public popLayer(id: string) {
    const layer = this.layerStack.find((el) => el.id === id);

    if (!layer) {
      return;
    }

    this.layerStack = this.layerStack.filter((curLayer) => curLayer !== layer);

    const newCurrentLayer = this.layerStack.at(-1);

    if (!layer.peripheral) {
      this.bodyScrollManager.unlock();
    }

    if (newCurrentLayer) {
      this.focusTrapper.trap(newCurrentLayer.getContainer());
    }
  }

  public getZIndexClassNameById(id: string): string | null {
    const indexOfLayerInStack = this.layerStack.findIndex((el) => el.id === id);
    return indexOfLayerInStack >= 0 ? `layer-${indexOfLayerInStack + 1}` : null;
  }

  public init() {
    this.focusTrapper.init();
  }

  public cleanup() {
    this.focusTrapper.cleanup();
    this.bodyScrollManager.reset();
    this.layerStack = [];
  }
}
