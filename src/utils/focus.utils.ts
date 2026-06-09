const focusableSelectors = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
];

export const getFirstFocusableElement = (
  container: HTMLElement,
): HTMLElement | null => {
  return container.querySelector<HTMLElement>(focusableSelectors.join(",")) ?? null;
};

export const getFocusable = (container: HTMLElement) => {
  const firstFocusableElements = container.querySelectorAll<HTMLElement>(
    focusableSelectors.join(","),
  );

  const focusableElements = [...firstFocusableElements].filter(
    element => element.tabIndex >= 0,
  );

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  return {
    focusableElements: [...focusableElements],
    first,
    last,
  };
};
