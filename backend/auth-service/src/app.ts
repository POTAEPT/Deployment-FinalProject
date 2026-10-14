import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { comparePassword, hashPassword } from "./lib/password";
import { signToken } from "./lib/token";
import type { UserStore } from "./store/userStore";

type Credentials = { username: string; password: string };

// ตอบ error รูปแบบเดียวกันทุก service ตาม api-contract
function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: "error", message });
}

// ตรวจ body ที่ขอบ service: ต้องมี username และ password เป็นข้อความที่ไม่ว่าง
function parseCredentials(body: unknown): Credentials | null {
  if (typeof body !== "object" || body === null) return null;
  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") return null;
  const trimmed = username.trim();
  if (trimmed === "" || password === "") return null;
  return { username: trimmed, password };
}

// สร้างแอปแยกจากการเปิด port (index.ts) เพื่อให้ทดสอบได้โดยส่ง store และ secret เข้ามาเอง
export function createApp(store: UserStore, jwtSecret: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/register", async (req, res) => {
    const credentials = parseCredentials(req.body);
    if (!credentials) return sendError(res, 400, "กรุณากรอก username และ password");

    if (store.findByUsername(credentials.username)) {
      return sendError(res, 409, "username นี้ถูกใช้แล้ว");
    }

    const passwordHash = await hashPassword(credentials.password);
    // เช็คซ้ำอีกรอบตอนบันทึก เผื่อมีคนสมัครชื่อเดียวกันระหว่างที่กำลัง hash
    if (!store.add({ username: credentials.username, passwordHash })) {
      return sendError(res, 409, "username นี้ถูกใช้แล้ว");
    }

    res.status(201).json({ status: "success", user: { username: credentials.username } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const credentials = parseCredentials(req.body);
    if (!credentials) return sendError(res, 400, "กรุณากรอก username และ password");

    // ไม่บอกว่าผิดที่ username หรือ password เพื่อไม่ให้เดาได้ว่ามี user นี้ในระบบ
    const user = store.findByUsername(credentials.username);
    if (!user || !(await comparePassword(credentials.password, user.passwordHash))) {
      return sendError(res, 401, "username หรือ password ไม่ถูกต้อง");
    }

    const token = signToken(user.username, jwtSecret);
    res.json({ status: "success", user: { username: user.username }, token });
  });

  // ไม่พบ endpoint
  app.use((_req, res) => {
    sendError(res, 404, "not found");
  });

  // error ที่ไม่ได้ดักไว้: JSON ใน body ผิดรูปแบบตอบ 400 นอกนั้นตอบ 500
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) return sendError(res, 400, "รูปแบบ JSON ไม่ถูกต้อง");
    console.error(err);
    sendError(res, 500, "internal server error");
  });

  return app;
}
