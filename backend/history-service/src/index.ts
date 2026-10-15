import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3004);

const app = createApp();
app.listen(PORT, () => {
  console.log(`history-service listening on port ${PORT}`);
});
