import "dotenv/config";
import { createApp } from "./app";
import { createTimerDurations, Timer } from "./lib/timer";
import { createTimerCompletionHandler } from "./lib/timerCompletion";

const PORT = Number(process.env.PORT ?? 3002);
const HISTORY_URL = process.env.HISTORY_URL ?? "http://history-service:3004";
const NOTIFY_URL = process.env.NOTIFY_URL ?? "http://notification-service:3005";

let timer: Timer;
try {
  timer = new Timer(
    createTimerDurations(),
    () => new Date(),
    createTimerCompletionHandler({ historyUrl: HISTORY_URL, notifyUrl: NOTIFY_URL }),
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const app = createApp(timer);
app.listen(PORT, () => {
  console.log(`timer-service listening on port ${PORT}`);
});
