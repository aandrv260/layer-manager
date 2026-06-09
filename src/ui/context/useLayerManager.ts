import { useContext } from "react";
import { LayerContext } from "@/ui/context/LayerContext";
import type { LayerManager } from "@/core/LayerManager";

/**
 * Access the `LayerManager` provided by the nearest `LayerProvider`.
 * Throws if used outside of a provider so misuse fails loudly.
 */
export const useLayerManager = (): LayerManager => {
  const context = useContext(LayerContext);

  if (!context) {
    throw new Error("useLayerManager must be used within a <LayerProvider>.");
  }

  return context.layerManager;
};
