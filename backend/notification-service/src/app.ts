import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import {
  buildMessage,
  isValidType,
  type NotificationEvent,
} from "./lib/notification";

function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: "error", message });
}

function isObjectBody(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}

export function createApp() {
  const app = express();
  const clients = new Set<Response>();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/notify", (req, res) => {
    const body: unknown = req.body;
    if (!isObjectBody(body) || !isValidType(body.type)) {
      return sendError(res, 400, "type ต้องเป็น focus_end, break_end หรือ timer_end");
    }

    const type = body.type;
    const inputMessage = body.message;
    if (inputMessage !== undefined && typeof inputMessage !== "string") {
      return sendError(res, 400, "message ต้องเป็นข้อความ");
    }

    const event: NotificationEvent = {
      type,
      message: buildMessage(type, inputMessage),
      time: new Date().toISOString(),
    };

    const sseMessage = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of clients) {
      if (client.destroyed || client.writableEnded) {
        clients.delete(client);
        continue;
      }

      client.write(sseMessage);
    }

    res.json({ status: "success", ...event });
  });

  app.get("/api/notify/stream", (req, res) => {
    res.status(200).set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();

    clients.add(res);
    req.on("close", () => {
      clients.delete(res);
    });
  });

  app.use((_req, res) => {
    sendError(res, 404, "not found");
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) {
      return sendError(res, 400, "รูปแบบ JSON ไม่ถูกต้อง");
    }

    console.error(err);
    return sendError(res, 500, "internal server error");
  });

  return app;
}
