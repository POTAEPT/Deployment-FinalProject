import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3005);
const app = createApp();

app.listen(PORT, () => {
  console.log(`notification-service listening on port ${PORT}`);
});
