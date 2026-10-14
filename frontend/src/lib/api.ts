import { getToken } from "./session";

// ชื่อ event ที่ยิงเมื่อ service ตอบ 401 ทั้งที่ส่ง token ไป (token หมดอายุ/ใช้ไม่ได้)
// AuthProvider ฟัง event นี้แล้ว logout ให้เอง
export const AUTH_EXPIRED_EVENT = "auth:expired";

// error จาก API: status คือ HTTP status (0 = ต่อ service ไม่ติด), message เอาไปแสดงผู้ใช้ได้เลย
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

// เรียก API ของทุก service ผ่านฟังก์ชันนี้:
// - ส่ง/รับ JSON ให้เอง
// - ถ้า login อยู่ แนบ Authorization: Bearer <token> ให้เอง
// - ตอบ error รูปแบบ { status: "error", message } จะ throw ApiError พร้อม message นั้น
export async function apiFetch<T>(url: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    // fetch throw เมื่อต่อไม่ติดเลย เช่น service ล่มหรือ URL ผิด
    throw new ApiError(0, "เชื่อมต่อระบบไม่ได้ ลองใหม่อีกครั้ง");
  }

  // บาง response อาจไม่มี body หรือไม่ใช่ JSON
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    const message =
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : `เกิดข้อผิดพลาด (${response.status})`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}
