import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { Timer, type TimerMode } from "./lib/timer";

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: "error", message });
}

function parseMode(body: unknown): TimerMode | null {
  if (typeof body !== "object" || body === null) return null;
  const mode = (body as Record<string, unknown>).mode;
  if (mode === "focus" || mode === "short_break" || mode === "long_break") return mode;
  return null;
}

export function createApp(timer: Timer = new Timer()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/timer/start", (req, res) => {
    const mode = parseMode(req.body);
    if (!mode) return sendError(res, 400, "mode ไม่ถูกต้อง");

    res.json(timer.start(mode));
  });

  app.post("/api/timer/pause", (_req, res) => {
    const state = timer.pause();
    if (!state) return sendError(res, 400, "timer ไม่ได้อยู่ในสถานะ running");

    res.json(state);
  });

  app.post("/api/timer/resume", (_req, res) => {
    const state = timer.resume();
    if (!state) return sendError(res, 400, "timer ไม่ได้อยู่ในสถานะ paused");

    res.json(state);
  });

  app.post("/api/timer/reset", (_req, res) => {
    res.json(timer.reset());
  });

  app.get("/api/timer/status", (_req, res) => {
    res.json(timer.getStatus());
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
