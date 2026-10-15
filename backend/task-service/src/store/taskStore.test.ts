import { describe, expect, it } from "vitest";
import { createTaskStore } from "./taskStore";

describe("taskStore", () => {
  it("add สร้าง task ใหม่ที่ completed=false และ id ไม่ซ้ำ", () => {
    const store = createTaskStore();

    const first = store.add("a", "งาน 1");
    const second = store.add("a", "งาน 2");

    expect(first.completed).toBe(false);
    expect(first.id).not.toBe(second.id);
  });

  it("แต่ละผู้ใช้เห็นเฉพาะ task ของตัวเอง", () => {
    const store = createTaskStore();
    const task = store.add("a", "งานของ a");

    expect(store.list("b")).toEqual([]);
    expect(store.update("b", task.id, { completed: true })).toBeNull();
    expect(store.remove("b", task.id)).toBe(false);
    expect(store.list("a")).toHaveLength(1);
  });

  it("update แล้วลบ task ได้", () => {
    const store = createTaskStore();
    const task = store.add("a", "งาน");

    expect(store.update("a", task.id, { completed: true })?.completed).toBe(true);
    expect(store.remove("a", task.id)).toBe(true);
    expect(store.list("a")).toEqual([]);
  });
});
