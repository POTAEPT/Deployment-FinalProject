import jwt from "jsonwebtoken";

// อายุ token ตาม api-contract: 1 ชั่วโมง
const TOKEN_EXPIRES_IN = "1h";

export type TokenPayload = { username: string };

// สร้าง JWT ที่มี username อยู่ข้างใน เซ็นด้วย secret (task-service ใช้ secret เดียวกันตรวจ)
export function signToken(username: string, secret: string): string {
  return jwt.sign({ username }, secret, { expiresIn: TOKEN_EXPIRES_IN });
}

// ตรวจ token ถ้าถูกต้องคืน payload ถ้าปลอม/หมดอายุ/รูปแบบผิด คืน null แทนการ throw
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
