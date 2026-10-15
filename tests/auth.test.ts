import { beforeAll, describe, expect, it } from "vitest";
import { api, PASSWORD, uniqueSuffix, URLS } from "./helpers";

const REGISTER = `${URLS.auth}/api/auth/register`;
const LOGIN = `${URLS.auth}/api/auth/login`;

describe("TS-01 Auth", () => {
  // user ที่มีอยู่แล้วในระบบ สำหรับเคสที่ precondition คือ "มี testuser1 อยู่แล้ว"
  const existing = `testuser1-${uniqueSuffix()}`;

  beforeAll(async () => {
    const created = await api("POST", REGISTER, { username: existing, password: PASSWORD });
    expect(created.status).toBe(201);
  });

  // ใช้ testuser1-<suffix> แทน testuser1 เพื่อให้รันซ้ำได้โดยไม่ชนกับ user ที่สมัครไว้รอบก่อน
  it("TS-01-01 สมัครสมาชิกสำเร็จ", async () => {
    const username = `testuser1-${uniqueSuffix()}`;
    const result = await api("POST", REGISTER, { username, password: PASSWORD });

    expect(result.status).toBe(201);
    expect(result.body.status).toBe("success");
    expect(result.body.user.username).toBe(username);
  });

  it("TS-01-02 สมัครด้วย username ซ้ำ", async () => {
    const result = await api("POST", REGISTER, { username: existing, password: PASSWORD });

    expect(result.status).toBe(409);
    expect(result.body.status).toBe("error");
    expect(result.body.message).toBeTruthy();
  });

  it("TS-01-03 Login สำเร็จ ได้ token", async () => {
    const result = await api("POST", LOGIN, { username: existing, password: PASSWORD });

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("success");
    expect(typeof result.body.token).toBe("string");
    expect(result.body.token.length).toBeGreaterThan(0);
  });

  it("TS-01-04 Login รหัสผ่านผิด", async () => {
    const result = await api("POST", LOGIN, { username: existing, password: "wrong" });

    expect(result.status).toBe(401);
    expect(result.body.status).toBe("error");
    expect(result.body.token).toBeUndefined();
  });

  it("TS-01-07 Login โดยไม่ส่ง password", async () => {
    const result = await api("POST", LOGIN, { username: existing });

    expect(result.status).toBe(400);
    expect(result.body.status).toBe("error");
  });
});
