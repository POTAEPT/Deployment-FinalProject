import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./token";

const SECRET = "test-secret";

describe("token", () => {
  // TS-01-06
  it("token ปลอมได้ null", () => {
    expect(verifyToken("abc.def.ghi", SECRET)).toBeNull();
  });

  // TS-01-06 (กรณีหมดอายุ): สร้าง token ที่ exp อยู่ในอดีตแล้ว 1 นาที
  it("token หมดอายุได้ null", () => {
    const expired = jwt.sign(
      { username: "testuser1", exp: Math.floor(Date.now() / 1000) - 60 },
      SECRET,
    );

    expect(verifyToken(expired, SECRET)).toBeNull();
  });

  it("token ที่ signToken สร้าง verify แล้วได้ username เดิม", () => {
    const token = signToken("testuser1", SECRET);

    expect(verifyToken(token, SECRET)).toEqual({ username: "testuser1" });
  });

  // จำลองกรณี task-service ตั้ง JWT_SECRET ไม่ตรงกับ auth-service
  it("token ที่เซ็นด้วย secret อื่นได้ null", () => {
    const token = signToken("testuser1", "other-secret");

    expect(verifyToken(token, SECRET)).toBeNull();
  });
});
