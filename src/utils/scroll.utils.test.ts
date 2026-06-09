import { toggleBodyScroll } from "@/utils/scroll.utils";

beforeEach(() => {
  document.body.style.overflow = "";
});

test("hides the body overflow when locking", () => {
  toggleBodyScroll("hidden");

  expect(document.body.style.overflow).toBe("hidden");
});

test("restores the body overflow when unlocking", () => {
  document.body.style.overflow = "hidden";

  toggleBodyScroll("visible");

  expect(document.body.style.overflow).toBe("visible");
});

test("can toggle back and forth", () => {
  toggleBodyScroll("hidden");
  toggleBodyScroll("visible");
  toggleBodyScroll("hidden");

  expect(document.body.style.overflow).toBe("hidden");
});
