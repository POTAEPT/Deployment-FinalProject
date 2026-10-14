// เก็บ token ไว้ใน localStorage เพื่อให้รีเฟรชหน้าแล้วยัง login อยู่
// ไฟล์นี้ไม่มี React ใช้ได้ทั้งจาก api.ts และ auth.tsx

const TOKEN_KEY = "pomodoro.token";

export type Session = { token: string; username: string };

type TokenPayload = { username?: unknown; exp?: unknown };

// อ่าน payload ของ JWT (ส่วนกลางระหว่างจุด) ไม่ได้ตรวจลายเซ็น แค่เอา username และ exp มาใช้
// การตรวจลายเซ็นจริงทำที่ฝั่ง service (task-service ฯลฯ)
function decodePayload(token: string): TokenPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}

// แปลง token เป็น session ถ้า token รูปแบบผิดหรือหมดอายุแล้วคืน null
function toSession(token: string): Session | null {
  const payload = decodePayload(token);
  if (!payload || typeof payload.username !== "string" || typeof payload.exp !== "number") {
    return null;
  }
  // exp เป็นวินาที Date.now() เป็นมิลลิวินาที
  if (payload.exp * 1000 <= Date.now()) return null;
  return { token, username: payload.username };
}

export function loadSession(): Session | null {
  const token = getToken();
  if (!token) return null;
  const session = toSession(token);
  if (!session) clearSession();
  return session;
}

export function saveSession(token: string): Session | null {
  const session = toSession(token);
  if (!session) return null;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage ใช้ไม่ได้ (เช่น private mode บางเบราว์เซอร์) ยัง login ได้แต่รีเฟรชแล้วต้อง login ใหม่
  }
  return session;
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ไม่มีอะไรให้ลบ
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
