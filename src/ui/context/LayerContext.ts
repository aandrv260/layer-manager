import { createContext } from "react";
import type { LayerManager } from "@/core/LayerManager";

interface LayerContextValue {
  layerManager: LayerManager;
}

export const LayerContext = createContext<LayerContextValue | undefined>(undefined);
