// URL ของแต่ละ service อ่านจาก .env (ก๊อปจาก .env.example)
// ค่าพวกนี้ Vite ฝังลงไปในไฟล์ตอน build ไม่ได้อ่านใหม่ตอนรัน
export const AUTH_URL = import.meta.env.VITE_AUTH_URL ?? "http://localhost:3001";
export const TIMER_URL = import.meta.env.VITE_TIMER_URL ?? "http://localhost:3002";
export const TASK_URL = import.meta.env.VITE_TASK_URL ?? "http://localhost:3003";
export const HISTORY_URL = import.meta.env.VITE_HISTORY_URL ?? "http://localhost:3004";
export const NOTIFY_URL = import.meta.env.VITE_NOTIFY_URL ?? "http://localhost:3005";
