import { BodyScrollManager } from "@/core/BodyScrollManager";

beforeEach(() => {
  document.body.style.overflow = "";
});

test("locks the body scroll on the first lock", () => {
  const manager = new BodyScrollManager();

  manager.lock();

  expect(document.body.style.overflow).toBe("hidden");
});

test("unlocking back to zero restores scrolling", () => {
  const manager = new BodyScrollManager();

  manager.lock();
  manager.unlock();

  expect(document.body.style.overflow).toBe("visible");
});

test("keeps the scroll locked while nested locks remain", () => {
  const manager = new BodyScrollManager();

  manager.lock();
  manager.lock();
  manager.unlock();

  expect(document.body.style.overflow).toBe("hidden");
  expect(manager.getCount()).toBe(1);
});

test("only restores scrolling once the last lock is released", () => {
  const manager = new BodyScrollManager();

  manager.lock();
  manager.lock();
  manager.unlock();
  manager.unlock();

  expect(document.body.style.overflow).toBe("visible");
  expect(manager.getCount()).toBe(0);
});

test("getCount reflects the number of outstanding locks", () => {
  const manager = new BodyScrollManager();

  expect(manager.getCount()).toBe(0);
  manager.lock();
  manager.lock();
  expect(manager.getCount()).toBe(2);
});

test("never lets the count go negative on a stray unlock", () => {
  const manager = new BodyScrollManager();

  manager.unlock();

  expect(manager.getCount()).toBe(0);
});

test("reset restores scrolling and clears the count when locked", () => {
  const manager = new BodyScrollManager();

  manager.lock();
  manager.lock();
  manager.reset();

  expect(document.body.style.overflow).toBe("visible");
  expect(manager.getCount()).toBe(0);
});

test("reset is a no-op for scrolling when nothing was locked", () => {
  const manager = new BodyScrollManager();

  manager.reset();

  expect(document.body.style.overflow).toBe("");
  expect(manager.getCount()).toBe(0);
});
