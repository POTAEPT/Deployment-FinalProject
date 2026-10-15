import "dotenv/config";
import { createApp } from "./app";
import { createTaskStore } from "./store/taskStore";

// ค่าตั้งต้นตาม api-contract (หัวข้อ Environment variables)
const PORT = Number(process.env.PORT ?? 3003);
const JWT_SECRET = process.env.JWT_SECRET;

// ไม่มี secret แล้วเปิดต่อไม่ได้ เพราะตรวจ token ของ auth-service ไม่ได้
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set (copy .env.example to .env)");
  process.exit(1);
}

const app = createApp(createTaskStore(), JWT_SECRET);
app.listen(PORT, () => {
  console.log(`task-service listening on port ${PORT}`);
});
