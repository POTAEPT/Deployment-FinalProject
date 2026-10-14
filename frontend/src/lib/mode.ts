// โหมดของ Timer ชื่อตรงกับ api-contract (timer-service)
export type Mode = "focus" | "short_break" | "long_break";

export const MODE_LABEL: Record<Mode, string> = {
  focus: "โฟกัส",
  short_break: "พักสั้น",
  long_break: "พักยาว",
};

// ต้องเขียนชื่อคลาสเต็มแบบนี้ Tailwind ถึงจะเห็นและสร้างสีให้ (ห้ามประกอบเป็น `bg-${mode}`)
export const MODE_BG: Record<Mode, string> = {
  focus: "bg-focus",
  short_break: "bg-short",
  long_break: "bg-long",
};

// สีข้อความของปุ่ม Primary (พื้นขาว ตัวหนังสือสีตามโหมด)
export const MODE_TEXT: Record<Mode, string> = {
  focus: "text-focus",
  short_break: "text-short",
  long_break: "text-long",
};
