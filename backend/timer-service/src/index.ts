import "dotenv/config";
import { createApp } from "./app";
import { createTimerDurations, Timer } from "./lib/timer";

const PORT = Number(process.env.PORT ?? 3002);

let timer: Timer;
try {
  timer = new Timer(createTimerDurations());
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const app = createApp(timer);
app.listen(PORT, () => {
  console.log(`timer-service listening on port ${PORT}`);
});
