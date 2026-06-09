import { ConsoleLogger } from "@/utils/ConsoleLogger";

test("writes each level to the matching console method", () => {
  const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});

  const logger = new ConsoleLogger();
  logger.debug("d");
  logger.info("i");
  logger.warn("w");
  logger.error("e");

  expect(debug).toHaveBeenCalledTimes(1);
  expect(info).toHaveBeenCalledTimes(1);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(1);
});

test("prefixes messages with the default prefix", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  new ConsoleLogger().warn("something happened");

  expect(warn).toHaveBeenCalledWith("[layers] something happened");
});

test("uses a custom prefix when provided", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  new ConsoleLogger("[custom]").info("hello");

  expect(info).toHaveBeenCalledWith("[custom] hello");
});

test("forwards extra arguments to the console", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const detail = { code: 42 };

  new ConsoleLogger().error("boom", detail);

  expect(error).toHaveBeenCalledWith("[layers] boom", detail);
});
