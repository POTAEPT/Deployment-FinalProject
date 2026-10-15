import { describe, expect, it } from "vitest";
import { api, historySummary, randomDate, URLS } from "./helpers";

const HISTORY = `${URLS.history}/api/history`;

describe("TS-04 History", () => {
  it("TS-04-01 บันทึก pomodoro ที่เสร็จ", async () => {
    const result = await api("POST", HISTORY, { focusMin: 25 });

    expect(result.status).toBe(201);
    expect(result.body.status).toBe("success");
  });

  // ใช้วันที่สุ่มในอดีต (ไม่ปนกับวันนี้และเคสอื่น) และเทียบก่อน/หลัง ไม่คาดว่าเริ่มที่ 0
  it("TS-04-02 ดูสรุปรายวัน", async () => {
    const date = randomDate(1950, 1999);
    const before = await historySummary(date);

    await api("POST", HISTORY, { focusMin: 25, date });
    await api("POST", HISTORY, { focusMin: 25, date });
    const after = await historySummary(date);

    expect(after.pomodoroCount - before.pomodoroCount).toBe(2);
    expect(after.totalFocusMin - before.totalFocusMin).toBe(50);
  });

  // วันที่ในช่วงที่ไม่มีเคสไหนบันทึก (1900–1949) จึงต้องไม่มีข้อมูลและไม่ใช่ 404
  it("TS-04-03 วันที่ไม่มีข้อมูล", async () => {
    const date = randomDate(1900, 1949);
    const result = await api("GET", `${HISTORY}/summary?date=${date}`);

    expect(result.status).toBe(200);
    expect(result.body.pomodoroCount).toBe(0);
    expect(result.body.totalFocusMin).toBe(0);
  });

  it("TS-04-06 focusMin ติดลบ", async () => {
    const result = await api("POST", HISTORY, { focusMin: -5 });

    expect(result.status).toBe(400);
    expect(result.body.status).toBe("error");
  });
});
