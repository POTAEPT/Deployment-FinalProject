import { beforeAll, describe, expect, it } from "vitest";
import { api, createUserToken, URLS } from "./helpers";

const TASKS = `${URLS.task}/api/tasks`;

describe("TS-03 Task", () => {
  // user ใหม่ทุกรอบ: task ของแต่ละ user แยกกัน จึงไม่เห็นข้อมูลของรอบก่อน
  let token = "";

  beforeAll(async () => {
    token = (await createUserToken("task-user")).token;
  });

  async function createTask(title: string) {
    const result = await api("POST", TASKS, { title }, token);
    expect(result.status).toBe(201);
    return result.body.task as { id: string; title: string; completed: boolean };
  }

  it("TS-03-01 เพิ่ม task ใหม่", async () => {
    const result = await api("POST", TASKS, { title: "อ่านหนังสือ" }, token);

    expect(result.status).toBe(201);
    expect(result.body.task.id).toBeTruthy();
    expect(result.body.task.title).toBe("อ่านหนังสือ");
    expect(result.body.task.completed).toBe(false);
  });

  it("TS-03-02 ดึงรายการ task", async () => {
    const task = await createTask("งานสำหรับ TS-03-02");

    const result = await api("GET", TASKS, undefined, token);

    expect(result.status).toBe(200);
    expect(Array.isArray(result.body.tasks)).toBe(true);
    expect(result.body.tasks).toContainEqual(task);
  });

  it("TS-03-03 ติ๊ก task ว่าเสร็จ", async () => {
    const task = await createTask("งานสำหรับ TS-03-03");

    const result = await api("PATCH", `${TASKS}/${task.id}`, { completed: true }, token);

    expect(result.status).toBe(200);
    expect(result.body.task.completed).toBe(true);
  });

  it("TS-03-04 ลบ task", async () => {
    const task = await createTask("งานสำหรับ TS-03-04");

    const deleted = await api("DELETE", `${TASKS}/${task.id}`, undefined, token);
    expect(deleted.status).toBe(200);
    expect(deleted.body).toEqual({ status: "success" });

    const list = await api("GET", TASKS, undefined, token);
    expect(list.body.tasks.map((t: { id: string }) => t.id)).not.toContain(task.id);
  });

  it("TS-03-07 เรียกโดยไม่มี token", async () => {
    const result = await api("GET", TASKS);

    expect(result.status).toBe(401);
  });
});
