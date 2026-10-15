// logic ของ history-service แยกเป็นฟังก์ชันล้วน เพื่อให้ unit test ได้โดยไม่ต้องเปิดเซิร์ฟเวอร์

export interface DailySummary {
  date: string;
  pomodoroCount: number;
  totalFocusMin: number;
}

// แปลง Date เป็น "YYYY-MM-DD" (ใช้เวลา UTC ให้ผลเหมือนกันทุกเครื่อง รวมถึงใน Docker)
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// เช็คว่าเป็นวันที่รูปแบบ YYYY-MM-DD และมีอยู่จริง (เช่น 2026-02-30 ไม่ผ่าน)
export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

// focusMin ต้องเป็นตัวเลขที่มากกว่า 0
export function isValidFocusMin(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

// รวมเวลาโฟกัสทั้งหมด เช่น [25, 25, 15] ได้ 65
export function sumFocusMin(minutes: number[]): number {
  return minutes.reduce((total, min) => total + min, 0);
}

// เก็บประวัติไว้ใน memory: key คือวันที่, value คือรายการ focusMin ของแต่ละรอบในวันนั้น
// ข้อมูลหายตอน restart ถือว่าปกติ (โปรเจกต์ห้ามใช้ database)
export class HistoryStore {
  private records = new Map<string, number[]>();

  add(focusMin: number, date: string): void {
    const minutes = this.records.get(date) ?? [];
    minutes.push(focusMin);
    this.records.set(date, minutes);
  }

  // วันที่ไม่มีข้อมูลจะได้ค่า 0 ทั้งคู่ (ไม่ใช่ error)
  getSummary(date: string): DailySummary {
    const minutes = this.records.get(date) ?? [];
    return {
      date,
      pomodoroCount: minutes.length,
      totalFocusMin: sumFocusMin(minutes),
    };
  }
}
