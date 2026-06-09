import { useLayerManager } from "@/ui/context/useLayerManager";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Layer } from "@/types/Layer";

interface Config {
  open: boolean;
  isPeripheral: boolean;
  initialFocusedElementRef?: RefObject<HTMLElement | null>;
}

export const useLayer = <T extends HTMLElement>({
  open,
  isPeripheral,
  initialFocusedElementRef,
}: Config) => {
  const [layerClassName, setLayerClassName] = useState<string | null>(null);
  const containerRef = useRef<T>(null);
  const layerManager = useLayerManager();

  const layer = useMemo<Layer>(() => {
    let id: string;

    do {
      id = crypto.randomUUID();
    } while (layerManager.hasId(id));

    return {
      id,
      peripheral: isPeripheral,
      getContainer: () => containerRef.current as T,
    };
  }, [layerManager, isPeripheral]);

  const focusLayerContainer = useEffectEvent(() => {
    if (isPeripheral) {
      return;
    }

    const element: HTMLElement | null =
      initialFocusedElementRef?.current ?? containerRef.current;

    element?.focus();
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    layerManager.addLayer(layer);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayerClassName(layerManager.getZIndexClassNameById(layer.id));
    focusLayerContainer();

    return () => layerManager.popLayer(layer.id);
  }, [open, layerManager, layer]);

  return {
    containerRef,
    layerClassName,
  };
};
