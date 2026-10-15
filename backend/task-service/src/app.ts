import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { validateTitle } from "./lib/task";
import { verifyToken } from "./lib/token";
import type { TaskStore } from "./store/taskStore";

// ตอบ error รูปแบบเดียวกันทุก service ตาม api-contract
function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: "error", message });
}

// สร้างแอปแยกจากการเปิด port (index.ts) เพื่อให้ทดสอบได้โดยส่ง store และ secret เข้ามาเอง
export function createApp(store: TaskStore, jwtSecret: string) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ด่านตรวจ token: อ่าน "Authorization: Bearer <token>" แล้วเก็บ username ไว้ใน res.locals
  function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
    const payload = token ? verifyToken(token, jwtSecret) : null;
    if (!payload) return sendError(res, 401, "unauthorized");
    res.locals.username = payload.username;
    next();
  }

  app.use("/api/tasks", requireAuth);

  app.get("/api/tasks", (_req, res) => {
    res.json({ status: "success", tasks: store.list(res.locals.username) });
  });

  app.post("/api/tasks", (req, res) => {
    const title = validateTitle(req.body?.title);
    if (!title) return sendError(res, 400, "กรุณากรอก title");

    const task = store.add(res.locals.username, title);
    res.status(201).json({ status: "success", task });
  });

  // ส่ง completed และ/หรือ title ได้ อย่างน้อยหนึ่งอย่าง
  app.patch("/api/tasks/:id", (req, res) => {
    const { completed, title } = req.body ?? {};
    const changes: { completed?: boolean; title?: string } = {};

    if (completed !== undefined) {
      if (typeof completed !== "boolean") return sendError(res, 400, "completed ต้องเป็น true/false");
      changes.completed = completed;
    }
    if (title !== undefined) {
      const validTitle = validateTitle(title);
      if (!validTitle) return sendError(res, 400, "title ต้องไม่ว่าง");
      changes.title = validTitle;
    }
    if (Object.keys(changes).length === 0) {
      return sendError(res, 400, "กรุณาส่ง completed หรือ title");
    }

    const task = store.update(res.locals.username, req.params.id as string, changes);
    if (!task) return sendError(res, 404, "ไม่พบ task");
    res.json({ status: "success", task });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    if (!store.remove(res.locals.username, req.params.id as string)) {
      return sendError(res, 404, "ไม่พบ task");
    }
    res.json({ status: "success" });
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
