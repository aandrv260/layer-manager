import { LayerManager } from "@/core/LayerManager";
import type { Layer } from "@/types/Layer";
import type { ILogger } from "@/types/ILogger";
import {
  createSilentLogger,
  createRecordingLogger,
  type LogRecord,
} from "@/test/helpers";

const createLayerManager = (logger: ILogger = createSilentLogger()) =>
  new LayerManager(logger);

const buildLayer = (
  id: string,
  options: { peripheral?: boolean; buttons?: string[] } = {},
) => {
  const { peripheral = false, buttons = ["x"] } = options;
  const container = document.createElement("div");
  container.tabIndex = -1;
  for (const label of buttons) {
    const button = document.createElement("button");
    button.textContent = label;
    container.appendChild(button);
  }
  document.body.appendChild(container);

  const layer: Layer = { id, peripheral, getContainer: () => container };
  return { layer, container };
};

let manager: LayerManager;
let logs: LogRecord[];

beforeEach(() => {
  document.body.style.overflow = "";
  const recording = createRecordingLogger();
  logs = recording.records;
  manager = createLayerManager(recording.logger);
});

afterEach(() => {
  manager.cleanup();
  document.body.innerHTML = "";
});

test("assigns z-index class names by position in the stack", () => {
  manager.addLayer(buildLayer("a").layer);
  manager.addLayer(buildLayer("b").layer);

  expect(manager.getZIndexClassNameById("a")).toBe("layer-1");
  expect(manager.getZIndexClassNameById("b")).toBe("layer-2");
});

test("returns null for the z-index of an unknown layer", () => {
  expect(manager.getZIndexClassNameById("missing")).toBeNull();
});

test("hasId reflects whether a layer is on the stack", () => {
  manager.addLayer(buildLayer("a").layer);

  expect(manager.hasId("a")).toBe(true);
  expect(manager.hasId("nope")).toBe(false);
});

test("findLayer returns the layer or null", () => {
  const a = buildLayer("a");
  manager.addLayer(a.layer);

  expect(manager.findLayer("a")).toBe(a.layer);
  expect(manager.findLayer("nope")).toBeNull();
});

test("locks body scroll when a non-peripheral layer is added", () => {
  manager.addLayer(buildLayer("a").layer);

  expect(document.body.style.overflow).toBe("hidden");
});

test("does not lock body scroll for a peripheral layer", () => {
  manager.addLayer(buildLayer("toast", { peripheral: true }).layer);

  expect(document.body.style.overflow).not.toBe("hidden");
});

test("unlocks body scroll when the non-peripheral layer is popped", () => {
  manager.addLayer(buildLayer("a").layer);
  manager.popLayer("a");

  expect(document.body.style.overflow).toBe("visible");
});

test("re-indexes z-index classes after a middle layer is popped", () => {
  manager.addLayer(buildLayer("a").layer);
  manager.addLayer(buildLayer("b").layer);
  manager.addLayer(buildLayer("c").layer);
  manager.popLayer("b");

  expect(manager.getZIndexClassNameById("a")).toBe("layer-1");
  expect(manager.getZIndexClassNameById("c")).toBe("layer-2");
  expect(manager.getZIndexClassNameById("b")).toBeNull();
});

test("popping an unknown layer is a no-op", () => {
  manager.addLayer(buildLayer("a").layer);
  manager.popLayer("ghost");

  expect(manager.hasId("a")).toBe(true);
  expect(manager.getZIndexClassNameById("a")).toBe("layer-1");
});

test("getFirstFocusableElementForLayer returns the first focusable element", () => {
  manager.addLayer(buildLayer("a", { buttons: ["one", "two"] }).layer);

  expect(manager.getFirstFocusableElementForLayer("a")?.textContent).toBe(
    "one",
  );
});

test("logs a warning through the injected logger for an unknown layer", () => {
  const result = manager.getFirstFocusableElementForLayer("missing");

  expect(result).toBeNull();
  expect(logs).toHaveLength(1);
  expect(logs[0].level).toBe("warn");
  expect(logs[0].message).toContain("missing");
});

test("does not log when everything resolves normally", () => {
  manager.addLayer(buildLayer("a", { buttons: ["one"] }).layer);

  manager.getFirstFocusableElementForLayer("a");

  expect(logs).toHaveLength(0);
});

test("init wires up focus trapping for the active layer", () => {
  const a = buildLayer("a", { buttons: ["one", "two"] });
  manager.init();
  manager.addLayer(a.layer);

  const buttons = [...a.container.querySelectorAll("button")];
  buttons[buttons.length - 1].focus();
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    }),
  );

  expect(document.activeElement).toBe(buttons[0]);
});

test("cleanup clears the stack and restores scrolling", () => {
  manager.addLayer(buildLayer("a").layer);
  manager.cleanup();

  expect(manager.hasId("a")).toBe(false);
  expect(manager.getZIndexClassNameById("a")).toBeNull();
  expect(document.body.style.overflow).toBe("visible");
});
