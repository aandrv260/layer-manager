import { getFirstFocusableElement, getFocusable } from "@/utils/focus.utils";

const container = (html: string): HTMLElement => {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el;
};

test("getFocusable returns focusable elements in document order", () => {
  const root = container(`
    <a href="#one">one</a>
    <button>two</button>
    <input />
  `);

  const { focusableElements, first, last } = getFocusable(root);

  expect(focusableElements).toHaveLength(3);
  expect(first.tagName).toBe("A");
  expect(last.tagName).toBe("INPUT");
});

test("getFocusable excludes disabled controls", () => {
  const root = container(`
    <button disabled>nope</button>
    <button>yes</button>
  `);

  const { focusableElements } = getFocusable(root);

  expect(focusableElements).toHaveLength(1);
  expect(focusableElements[0].textContent).toBe("yes");
});

test("getFocusable excludes elements with tabindex -1", () => {
  const root = container(`
    <div tabindex="-1">skip</div>
    <button>keep</button>
  `);

  const { focusableElements } = getFocusable(root);

  expect(focusableElements).toHaveLength(1);
  expect(focusableElements[0].tagName).toBe("BUTTON");
});

test("getFocusable includes elements with a non-negative tabindex", () => {
  const root = container(`<div tabindex="0">focusable div</div>`);

  const { focusableElements, first } = getFocusable(root);

  expect(focusableElements).toHaveLength(1);
  expect(first.textContent).toBe("focusable div");
});

test("getFocusable returns an empty set when nothing is focusable", () => {
  const root = container(`<p>just text</p>`);

  const { focusableElements, first, last } = getFocusable(root);

  expect(focusableElements).toEqual([]);
  expect(first).toBeUndefined();
  expect(last).toBeUndefined();
});

test("getFirstFocusableElement returns the first focusable element", () => {
  const root = container(`
    <span>text</span>
    <button>first</button>
    <button>second</button>
  `);

  expect(getFirstFocusableElement(root)?.textContent).toBe("first");
});

test("getFirstFocusableElement returns null when there is nothing to focus", () => {
  const root = container(`<button disabled>no</button>`);

  expect(getFirstFocusableElement(root)).toBeNull();
});
