import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createUserStore } from "./userStore";

// แต่ละเคสใช้โฟลเดอร์ชั่วคราวของตัวเอง ไม่แตะไฟล์ data/ จริงของ service
let dir: string;
let usersFile: string;
let seedFile: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "auth-store-"));
  usersFile = path.join(dir, "data", "users.json");
  seedFile = path.join(dir, "users.seed.json");
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("userStore", () => {
  it("ยังไม่มีไฟล์ users ให้สร้างโฟลเดอร์และคัดลอกบัญชีจาก seed", () => {
    fs.writeFileSync(seedFile, JSON.stringify([{ username: "demo1", passwordHash: "x" }]));
    const store = createUserStore(usersFile, seedFile);

    store.ensureFile();

    expect(fs.existsSync(usersFile)).toBe(true);
    expect(store.findByUsername("demo1")).toEqual({ username: "demo1", passwordHash: "x" });
  });

  it("ไม่มีทั้งไฟล์ users และ seed ให้เริ่มจากรายการว่าง", () => {
    const store = createUserStore(usersFile, seedFile);

    expect(store.findByUsername("demo1")).toBeUndefined();
    expect(JSON.parse(fs.readFileSync(usersFile, "utf8"))).toEqual([]);
  });

  it("เพิ่ม user ใหม่ได้ true และยังอยู่เมื่อเปิด store ใหม่ (เหมือน restart)", () => {
    const store = createUserStore(usersFile, seedFile);

    expect(store.add({ username: "testuser1", passwordHash: "h" })).toBe(true);

    const reopened = createUserStore(usersFile, seedFile);
    expect(reopened.findByUsername("testuser1")).toEqual({ username: "testuser1", passwordHash: "h" });
  });

  it("เพิ่ม username ซ้ำได้ false และไม่เขียนทับของเดิม", () => {
    const store = createUserStore(usersFile, seedFile);
    store.add({ username: "testuser1", passwordHash: "first" });

    expect(store.add({ username: "testuser1", passwordHash: "second" })).toBe(false);
    expect(store.findByUsername("testuser1")?.passwordHash).toBe("first");
  });

  it("มีไฟล์ users อยู่แล้วจะไม่คัดลอก seed ทับ", () => {
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify([{ username: "testuser1", passwordHash: "h" }]));
    fs.writeFileSync(seedFile, JSON.stringify([{ username: "demo1", passwordHash: "x" }]));
    const store = createUserStore(usersFile, seedFile);

    expect(store.findByUsername("testuser1")).toBeDefined();
    expect(store.findByUsername("demo1")).toBeUndefined();
  });
});
