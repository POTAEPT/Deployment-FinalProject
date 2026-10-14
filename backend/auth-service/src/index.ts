import "dotenv/config";
import path from "node:path";
import { createApp } from "./app";
import { createUserStore } from "./store/userStore";

// ค่าตั้งต้นตาม api-contract (หัวข้อ Environment variables)
const PORT = Number(process.env.PORT ?? 3001);
const USERS_FILE = process.env.USERS_FILE ?? "./data/users.json";
const JWT_SECRET = process.env.JWT_SECRET;
// path ของ seed คิดจากโฟลเดอร์ที่รันคำสั่ง (root ของ service หรือ /app ใน Docker)
const SEED_FILE = path.resolve("seed/users.seed.json");

// ไม่มี secret แล้วเปิดต่อไม่ได้ เพราะ token ที่ออกจะตรวจกับ task-service ไม่ผ่าน
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set (copy .env.example to .env)");
  process.exit(1);
}

const store = createUserStore(USERS_FILE, SEED_FILE);
// สร้างไฟล์ users ตั้งแต่ตอนเปิด ถ้าไม่มีสิทธิ์เขียนจะพังทันที ไม่ใช่ไปพังตอนมีคนสมัคร
store.ensureFile();

const app = createApp(store, JWT_SECRET);
app.listen(PORT, () => {
  console.log(`auth-service listening on port ${PORT}`);
});
