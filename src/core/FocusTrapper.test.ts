import { FocusTrapper } from "@/core/FocusTrapper";

const buildContainer = (labels: string[]) => {
  const el = document.createElement("div");
  el.tabIndex = -1;
  for (const label of labels) {
    const button = document.createElement("button");
    button.textContent = label;
    el.appendChild(button);
  }
  document.body.appendChild(el);
  const buttons = [...el.querySelectorAll("button")];
  return { el, buttons };
};

const pressTab = (shiftKey: boolean) => {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
};

let trapper: FocusTrapper;

beforeEach(() => {
  trapper = new FocusTrapper();
  trapper.init();
});

afterEach(() => {
  trapper.cleanup();
  document.body.innerHTML = "";
});

test("Tab on the last element wraps focus to the first", () => {
  const { el, buttons } = buildContainer(["a", "b", "c"]);
  trapper.trap(el);

  buttons[buttons.length - 1].focus();
  const event = pressTab(false);

  expect(document.activeElement).toBe(buttons[0]);
  expect(event.defaultPrevented).toBe(true);
});

test("Shift+Tab on the first element wraps focus to the last", () => {
  const { el, buttons } = buildContainer(["a", "b", "c"]);
  trapper.trap(el);

  buttons[0].focus();
  const event = pressTab(true);

  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  expect(event.defaultPrevented).toBe(true);
});

test("Tab from the container itself moves focus to the first element", () => {
  const { el, buttons } = buildContainer(["a", "b"]);
  trapper.trap(el);

  el.focus();
  const event = pressTab(false);

  expect(document.activeElement).toBe(buttons[0]);
  expect(event.defaultPrevented).toBe(true);
});

test("Shift+Tab from the container itself moves focus to the last element", () => {
  const { el, buttons } = buildContainer(["a", "b"]);
  trapper.trap(el);

  el.focus();
  const event = pressTab(true);

  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  expect(event.defaultPrevented).toBe(true);
});

test("Tab in the middle is left to the browser", () => {
  const { el, buttons } = buildContainer(["a", "b", "c"]);
  trapper.trap(el);

  buttons[0].focus();
  const event = pressTab(false);

  expect(event.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(buttons[0]);
});

test("pins focus to the container when there is nothing focusable inside", () => {
  const { el } = buildContainer([]);
  trapper.trap(el);

  el.focus();
  const event = pressTab(false);

  expect(document.activeElement).toBe(el);
  expect(event.defaultPrevented).toBe(true);
});

test("ignores keys other than Tab", () => {
  const { el, buttons } = buildContainer(["a", "b"]);
  trapper.trap(el);

  buttons[buttons.length - 1].focus();
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
});

test("does nothing when no container has been trapped", () => {
  const { buttons } = buildContainer(["a", "b"]);

  buttons[buttons.length - 1].focus();
  const event = pressTab(false);

  expect(event.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
});

test("stops trapping after cleanup", () => {
  const { el, buttons } = buildContainer(["a", "b"]);
  trapper.trap(el);
  trapper.cleanup();

  buttons[buttons.length - 1].focus();
  const event = pressTab(false);

  expect(event.defaultPrevented).toBe(false);
  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
});

test("traps within the most recently trapped container", () => {
  const first = buildContainer(["a1", "a2"]);
  const second = buildContainer(["b1", "b2"]);
  trapper.trap(first.el);
  trapper.trap(second.el);

  second.buttons[second.buttons.length - 1].focus();
  pressTab(false);

  expect(document.activeElement).toBe(second.buttons[0]);
});
