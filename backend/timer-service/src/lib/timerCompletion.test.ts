import { describe, expect, it, vi } from "vitest";
import { createTimerCompletionHandler } from "./timerCompletion";

describe("timer completion notifications", () => {
  it("sends completed focus time to History and timer_end to Notification", async () => {
    const fetcher = vi.fn(async () => ({ ok: true, status: 200 }));
    const handler = createTimerCompletionHandler({
      historyUrl: "http://history:3004/",
      notifyUrl: "http://notification:3005",
      fetcher,
    });

    await handler("focus");

    expect(fetcher).toHaveBeenNthCalledWith(1, "http://history:3004/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focusMin: 25 }),
    });
    expect(fetcher).toHaveBeenNthCalledWith(2, "http://notification:3005/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "timer_end" }),
    });
  });

  it("notifies on a break completion without recording History", async () => {
    const fetcher = vi.fn(async () => ({ ok: true, status: 200 }));
    const handler = createTimerCompletionHandler({
      historyUrl: "http://history:3004",
      notifyUrl: "http://notification:3005",
      fetcher,
    });

    await handler("short_break");

    expect(fetcher).toHaveBeenCalledExactlyOnceWith("http://notification:3005/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "timer_end" }),
    });
  });

  it("skips unconfigured URLs and reports them without throwing", async () => {
    const fetcher = vi.fn(async () => ({ ok: true, status: 200 }));
    const logger = { warn: vi.fn(), error: vi.fn() };
    const handler = createTimerCompletionHandler({ fetcher, logger });

    await expect(handler("focus")).resolves.toBeUndefined();

    expect(fetcher).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it("logs request failures and still attempts the other service", async () => {
    const fetcher = vi.fn(async (url: string) => {
      if (url.includes("/api/history")) throw new Error("history unavailable");
      return { ok: true, status: 200 };
    });
    const logger = { warn: vi.fn(), error: vi.fn() };
    const handler = createTimerCompletionHandler({
      historyUrl: "http://history:3004",
      notifyUrl: "http://notification:3005",
      fetcher,
      logger,
    });

    await expect(handler("focus")).resolves.toBeUndefined();

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledExactlyOnceWith(
      "Failed to notify History service",
      expect.any(Error),
    );
  });

  it("logs non-success responses without rejecting the completion handler", async () => {
    const fetcher = vi.fn(async () => ({ ok: false, status: 503 }));
    const logger = { warn: vi.fn(), error: vi.fn() };
    const handler = createTimerCompletionHandler({
      notifyUrl: "http://notification:3005",
      fetcher,
      logger,
    });

    await expect(handler("long_break")).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledExactlyOnceWith(
      "Failed to notify Notification service",
      expect.objectContaining({ message: "Notification service returned HTTP 503" }),
    );
  });
});
