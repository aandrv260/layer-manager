import type { PropsWithChildrenRequired } from "@/types/react.types";
import type { LayerManager } from "@/core/LayerManager";
import { useEffect, useMemo } from "react";
import { LayerContext } from "@/ui/context/LayerContext";

interface Props extends PropsWithChildrenRequired {
  layerManager: LayerManager;
}

export default function LayerProvider({ children, layerManager }: Props) {
  const value = useMemo(() => ({ layerManager }), [layerManager]);

  useEffect(() => {
    layerManager.init();
    return () => layerManager.cleanup();
  }, [layerManager]);

  return <LayerContext value={value}>{children}</LayerContext>;
}
