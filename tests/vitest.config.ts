import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // timer-service มี timer ตัวเดียวทั้งระบบ ถ้ารันหลายไฟล์พร้อมกันเทสต์จะชนกัน จึงรันทีละไฟล์
    fileParallelism: false,
    // ยิง service จริงผ่าน network และบางเคสต้องรอ timer จบ จึงให้เวลานานกว่าค่าเริ่มต้น
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
