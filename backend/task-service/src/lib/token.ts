import jwt from "jsonwebtoken";

export type TokenPayload = { username: string };

// ตรวจ token ที่ auth-service ออกให้ (ใช้ JWT_SECRET ตัวเดียวกัน)
// ถ้าถูกต้องคืน payload ถ้าปลอม/หมดอายุ/รูปแบบผิด คืน null แทนการ throw
export function verifyToken(token: string, secret: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && typeof decoded.username === "string") {
      return { username: decoded.username };
    }
    return null;
  } catch {
    return null;
  }
}
