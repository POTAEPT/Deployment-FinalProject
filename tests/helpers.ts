// ของที่เทสต์ทุกไฟล์ใช้ร่วมกัน: URL ของ service, ยิง API, สร้างข้อมูลไม่ซ้ำ, timer, SSE

// URL ของ service ที่ยกด้วย docker compose (เปลี่ยนได้ด้วย env)
export const URLS = {
  auth: process.env.AUTH_URL ?? "http://localhost:3001",
  timer: process.env.TIMER_URL ?? "http://localhost:3002",
  task: process.env.TASK_URL ?? "http://localhost:3003",
  history: process.env.HISTORY_URL ?? "http://localhost:3004",
  notify: process.env.NOTIFY_URL ?? "http://localhost:3005",
};

// เวลาของแต่ละโหมด ต้องเป็นค่าเดียวกับที่ส่งให้ timer-service ตอน docker compose up
// (ใน CI ตั้ง FOCUS_SECONDS=3 เพื่อให้ IT-03 / IT-04 รอไม่นาน)
export const DURATIONS = {
  focus: Number(process.env.FOCUS_SECONDS ?? 1500),
  short_break: Number(process.env.SHORT_BREAK_SECONDS ?? 300),
  long_break: Number(process.env.LONG_BREAK_SECONDS ?? 900),
};

export const PASSWORD = "Passw0rd!";

// response ของแต่ละ endpoint หน้าตาต่างกัน จึงใช้ any แล้วเช็ค field ในเทสต์เอง
type Json = any;

export type ApiResult = { status: number; body: Json };

// ยิง API แล้วคืน HTTP status กับ JSON (ไม่ throw ตอนได้ 4xx เพราะหลายเคสตั้งใจทดสอบ error)
export async function api(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  body?: unknown,
  token?: string,
): Promise<ApiResult> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null };
}

// ข้อความไม่ซ้ำต่อเคส ใช้ต่อท้าย username / message เพื่อให้รันซ้ำได้โดยไม่ชนข้อมูลเก่า
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// วันที่สุ่มในช่วงปีที่กำหนด (ใช้แยกข้อมูลของแต่ละเคส history ไม่ให้ปนกับวันนี้หรือเคสอื่น)
export function randomDate(fromYear: number, toYear: number): string {
  const year = fromYear + Math.floor(Math.random() * (toYear - fromYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// สมัคร user ใหม่ (ชื่อไม่ซ้ำ) แล้ว login คืน token
export async function createUserToken(prefix: string): Promise<{ username: string; token: string }> {
  const username = `${prefix}-${uniqueSuffix()}`;
  await api("POST", `${URLS.auth}/api/auth/register`, { username, password: PASSWORD });
  const login = await api("POST", `${URLS.auth}/api/auth/login`, { username, password: PASSWORD });
  if (login.status !== 200) throw new Error(`login failed for ${username}: ${login.status}`);
  return { username, token: login.body.token };
}

// สรุป history ของวันที่ระบุ (ไม่ส่ง = วันนี้ของ server)
export async function historySummary(date?: string): Promise<{ pomodoroCount: number; totalFocusMin: number }> {
  const query = date ? `?date=${date}` : "";
  const result = await api("GET", `${URLS.history}/api/history/summary${query}`);
  if (result.status !== 200) throw new Error(`history summary failed: ${result.status}`);
  return result.body;
}

// หยุด timer ทุกครั้งก่อน/หลังเทสต์ ไม่งั้น focus ที่ค้างอยู่จะจบเองแล้วไปเพิ่ม history / ยิงแจ้งเตือนกวนเคสอื่น
export async function resetTimer(): Promise<void> {
  await api("POST", `${URLS.timer}/api/timer/reset`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SseEvent = { type: string; message: string; time: string };

// เปิด SSE ค้างไว้แล้วเก็บ event ที่เข้ามา ใช้ waitFor() รอ event ที่ต้องการ
export async function openSse(url: string) {
  const controller = new AbortController();
  // fetch คืนค่าตอนได้ header แล้ว แปลว่า server รับ client นี้เข้ารายการแล้ว
  const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/event-stream" } });
  if (!response.ok || !response.body) throw new Error(`SSE connect failed: ${response.status}`);

  const events: SseEvent[] = [];
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // อ่าน stream เรื่อยๆ แยก event ด้วยบรรทัดว่าง (\n\n) ตามรูปแบบ SSE
  void (async () => {
    let buffer = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let end = buffer.indexOf("\n\n");
        while (end >= 0) {
          const chunk = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          const data = chunk
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("\n");
          if (data) events.push(JSON.parse(data));
          end = buffer.indexOf("\n\n");
        }
      }
    } catch {
      // ปิด connection ด้วย abort() จะมาตรงนี้ ถือว่าปกติ
    }
  })();

  return {
    async waitFor(match: (event: SseEvent) => boolean, timeoutMs: number): Promise<SseEvent> {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const found = events.find(match);
        if (found) return found;
        await sleep(50);
      }
      throw new Error(`ไม่ได้รับ SSE event ที่ต้องการภายใน ${timeoutMs} ms (ได้มา ${events.length} event)`);
    },
    close() {
      controller.abort();
    },
  };
}
