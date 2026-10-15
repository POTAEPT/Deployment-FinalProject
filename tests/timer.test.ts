import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api, DURATIONS, resetTimer, sleep, URLS } from "./helpers";

const TIMER = `${URLS.timer}/api/timer`;

describe("TS-02 Timer", () => {
  // timer มีตัวเดียวทั้งระบบ: reset ก่อนและหลังทุกเคส ไม่ให้ focus ที่ค้างจบเองแล้วกวนเคสอื่น
  beforeEach(resetTimer);
  afterEach(resetTimer);

  // ค่าที่คาดหวังอ่านจาก FOCUS_SECONDS ตัวเดียวกับที่ส่งให้ timer-service (ไม่ตั้ง = 1500)
  it("TS-02-01 เริ่ม Pomodoro (focus)", async () => {
    const result = await api("POST", `${TIMER}/start`, { mode: "focus" });

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("running");
    expect(result.body.timeLeft).toBe(DURATIONS.focus);
    expect(Date.parse(result.body.endTime)).not.toBeNaN();
  });

  it("TS-02-02 เริ่มโหมด short break", async () => {
    const result = await api("POST", `${TIMER}/start`, { mode: "short_break" });

    expect(result.status).toBe(200);
    expect(result.body.timeLeft).toBe(DURATIONS.short_break);
  });

  // ใช้ long_break (ยาว) แทน focus เพราะใน CI focus สั้นมาก จะจบก่อนกด pause
  it("TS-02-03 Pause แล้ว Resume", async () => {
    const started = await api("POST", `${TIMER}/start`, { mode: "long_break" });
    expect(started.status).toBe(200);
    await sleep(1_100);

    const paused = await api("POST", `${TIMER}/pause`);
    expect(paused.status).toBe(200);
    expect(paused.body.status).toBe("paused");
    expect(paused.body.endTime).toBeNull();

    // รอแล้วเช็คว่าเวลาค้างอยู่ ไม่ลดลงระหว่าง pause
    await sleep(1_100);
    const status = await api("GET", `${TIMER}/status`);
    expect(status.body.timeLeft).toBe(paused.body.timeLeft);

    const resumed = await api("POST", `${TIMER}/resume`);
    expect(resumed.status).toBe(200);
    expect(resumed.body.status).toBe("running");
    expect(resumed.body.timeLeft).toBe(paused.body.timeLeft);
    expect(Date.parse(resumed.body.endTime)).toBeGreaterThan(Date.parse(started.body.endTime));
  });

  it("TS-02-04 Reset timer", async () => {
    await api("POST", `${TIMER}/start`, { mode: "long_break" });

    const result = await api("POST", `${TIMER}/reset`);

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("idle");
    expect(result.body.timeLeft).toBe(DURATIONS.long_break);
  });

  it("TS-02-07 mode ไม่ถูกต้อง", async () => {
    const result = await api("POST", `${TIMER}/start`, { mode: "xyz" });

    expect(result.status).toBe(400);
    expect(result.body.status).toBe("error");
  });
});
