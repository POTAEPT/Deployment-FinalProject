import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "./password";

describe("password", () => {
  // TS-01-05
  it("hash แล้วไม่เท่ากับรหัสเดิม และ compare กับรหัสเดิมได้ true", async () => {
    const hash = await hashPassword("Passw0rd!");

    expect(hash).not.toBe("Passw0rd!");
    expect(await comparePassword("Passw0rd!", hash)).toBe(true);
  });

  it("compare กับรหัสผิดได้ false", async () => {
    const hash = await hashPassword("Passw0rd!");

    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("hash รหัสเดียวกันสองครั้งได้ผลไม่เหมือนกัน (มี salt)", async () => {
    const first = await hashPassword("Passw0rd!");
    const second = await hashPassword("Passw0rd!");

    expect(first).not.toBe(second);
  });
});
