import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { verifyToken } from "./token";

const SECRET = "test-secret";

describe("verifyToken", () => {
  // TS-03-07 / IT-02: token ปลอมต้องถูกปฏิเสธ
  it("token ปลอมได้ null", () => {
    expect(verifyToken("abc.def.ghi", SECRET)).toBeNull();
  });

  // IT-01: token ที่ auth-service ออก (เซ็นด้วย secret เดียวกัน) ต้องผ่าน
  it("token ที่เซ็นด้วย secret เดียวกันได้ username", () => {
    const token = jwt.sign({ username: "testuser1" }, SECRET);

    expect(verifyToken(token, SECRET)).toEqual({ username: "testuser1" });
  });

  it("token ที่เซ็นด้วย secret อื่นได้ null", () => {
    const token = jwt.sign({ username: "testuser1" }, "other-secret");

    expect(verifyToken(token, SECRET)).toBeNull();
  });

  it("token หมดอายุได้ null", () => {
    const expired = jwt.sign({ username: "testuser1", exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);

    expect(verifyToken(expired, SECRET)).toBeNull();
  });
});
