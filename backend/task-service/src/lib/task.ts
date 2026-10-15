export type Task = { id: string; title: string; completed: boolean };

// ตรวจชื่อ task: ต้องเป็นข้อความที่ไม่ว่าง (ตัดช่องว่างหัวท้ายก่อน)
// ผ่าน → คืนชื่อที่ตัดช่องว่างแล้ว, ไม่ผ่าน → คืน null
export function validateTitle(title: unknown): string | null {
  if (typeof title !== "string") return null;
  const trimmed = title.trim();
  return trimmed === "" ? null : trimmed;
}

// สลับสถานะ completed (false→true, true→false) โดยไม่แก้ object เดิม
export function toggleTask(task: Task): Task {
  return { ...task, completed: !task.completed };
}
