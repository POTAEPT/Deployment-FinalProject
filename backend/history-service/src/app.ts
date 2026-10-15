import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { formatDate, HistoryStore, isValidDate, isValidFocusMin } from "./lib/history";

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: "error", message });
}

// รับ store และฟังก์ชันบอกเวลาจากภายนอก เพื่อให้ test กำหนด "วันนี้" เองได้
export function createApp(store: HistoryStore = new HistoryStore(), now: () => Date = () => new Date()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // บันทึกรอบโฟกัสที่จบแล้ว (timer-service เรียกตอนจบรอบ focus)
  app.post("/api/history", (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;

    if (!isValidFocusMin(body.focusMin)) {
      return sendError(res, 400, "focusMin ต้องเป็นตัวเลขที่มากกว่า 0");
    }

    // ไม่ส่ง date มา ใช้วันนี้
    const date = body.date ?? formatDate(now());
    if (!isValidDate(date)) {
      return sendError(res, 400, "date ต้องเป็นรูปแบบ YYYY-MM-DD");
    }

    store.add(body.focusMin, date);
    res.status(201).json({ status: "success" });
  });

  // สรุปรายวัน: ทำกี่รอบ โฟกัสรวมกี่นาที
  app.get("/api/history/summary", (req, res) => {
    const date = req.query.date ?? formatDate(now());
    if (!isValidDate(date)) {
      return sendError(res, 400, "date ต้องเป็นรูปแบบ YYYY-MM-DD");
    }

    res.json({ status: "success", ...store.getSummary(date) });
  });

  app.use((_req, res) => {
    sendError(res, 404, "not found");
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) return sendError(res, 400, "รูปแบบ JSON ไม่ถูกต้อง");
    console.error(err);
    sendError(res, 500, "internal server error");
  });

  return app;
}
