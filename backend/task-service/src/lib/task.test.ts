import { describe, expect, it } from "vitest";
import { toggleTask, validateTitle, type Task } from "./task";

describe("validateTitle", () => {
  // TS-03-05: title ว่างต้องไม่ผ่าน
  it("title ว่างไม่ผ่าน (คืน null)", () => {
    expect(validateTitle("")).toBeNull();
  });

  it("title ที่มีแต่ช่องว่างไม่ผ่าน", () => {
    expect(validateTitle("   ")).toBeNull();
  });

  it("ค่าที่ไม่ใช่ข้อความไม่ผ่าน", () => {
    expect(validateTitle(undefined)).toBeNull();
    expect(validateTitle(123)).toBeNull();
  });

  it("title ปกติผ่าน และตัดช่องว่างหัวท้าย", () => {
    expect(validateTitle("  อ่านหนังสือ ")).toBe("อ่านหนังสือ");
  });
});

describe("toggleTask", () => {
  const task: Task = { id: "1", title: "อ่านหนังสือ", completed: false };

  // TS-03-06: false → true
  it("สลับ completed จาก false เป็น true", () => {
    expect(toggleTask(task).completed).toBe(true);
  });

  it("สลับ completed จาก true กลับเป็น false", () => {
    expect(toggleTask({ ...task, completed: true }).completed).toBe(false);
  });

  it("ไม่แก้ object เดิม และ field อื่นคงเดิม", () => {
    const result = toggleTask(task);

    expect(task.completed).toBe(false);
    expect(result).toEqual({ id: "1", title: "อ่านหนังสือ", completed: true });
  });
});
