import type { TimerMode } from "./timer";

type TimerCompletionResponse = Pick<Response, "ok" | "status">;
type TimerFetch = (input: string, init: RequestInit) => Promise<TimerCompletionResponse>;
type TimerLogger = Pick<Console, "warn" | "error">;

type TimerCompletionOptions = {
  historyUrl?: string;
  notifyUrl?: string;
  fetcher?: TimerFetch;
  logger?: TimerLogger;
};

export function createTimerCompletionHandler({
  historyUrl,
  notifyUrl,
  fetcher = fetch,
  logger = console,
}: TimerCompletionOptions = {}) {
  return async (mode: TimerMode): Promise<void> => {
    const requests: Promise<void>[] = [];

    if (mode === "focus") {
      if (historyUrl) {
        requests.push(
          postJson(historyUrl, "/api/history", { focusMin: 25 }, "History", fetcher, logger),
        );
      } else {
        logger.warn("HISTORY_URL is not set; skipping focus history notification");
      }
    }

    if (notifyUrl) {
      requests.push(
        postJson(notifyUrl, "/api/notify", { type: "timer_end" }, "Notification", fetcher, logger),
      );
    } else {
      logger.warn("NOTIFY_URL is not set; skipping timer-end notification");
    }

    await Promise.all(requests);
  };
}

async function postJson(
  baseUrl: string,
  path: string,
  payload: Record<string, number | string>,
  serviceName: string,
  fetcher: TimerFetch,
  logger: TimerLogger,
): Promise<void> {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}${path}`;

  try {
    const response = await fetcher(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`${serviceName} service returned HTTP ${response.status}`);
    }
  } catch (error) {
    logger.error(`Failed to notify ${serviceName} service`, error);
  }
}
