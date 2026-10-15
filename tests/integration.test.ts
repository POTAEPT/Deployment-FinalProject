import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api, createUserToken, DURATIONS, historySummary, openSse, resetTimer, sleep, URLS } from "./helpers";

// เวลารอให้ timer จบ: ความยาว focus + เผื่อให้ timer เรียก history / notification เสร็จ
const WAIT_FOR_FOCUS_MS = (DURATIONS.focus + 5) * 1000;

describe("Integration ข้าม service", () => {
  it("IT-01 ใช้ token จาก Auth สร้าง task", async () => {
    const { token } = await createUserToken("it01-user");

    const result = await api("POST", `${URLS.task}/api/tasks`, { title: "งานจาก IT-01" }, token);

    expect(result.status).toBe(201);
  });

  it("IT-02 token ปลอมถูก Task ปฏิเสธ", async () => {
    const result = await api("POST", `${URLS.task}/api/tasks`, { title: "ไม่ควรสร้างได้" }, "fake");

    expect(result.status).toBe(401);
  });

  describe("Timer จบรอบ", () => {
    beforeEach(resetTimer);
    afterEach(resetTimer);

    // เทียบสรุปของวันนี้ก่อน/หลัง (ไม่คาดว่าเริ่มที่ 0) แล้วรอจนนับเพิ่ม
    it(
      "IT-03 Timer จบแล้ว History นับเพิ่ม",
      async () => {
        const before = await historySummary();

        const started = await api("POST", `${URLS.timer}/api/timer/start`, { mode: "focus" });
        expect(started.status).toBe(200);

        let after = before;
        const deadline = Date.now() + WAIT_FOR_FOCUS_MS;
        while (Date.now() < deadline) {
          await sleep(250);
          after = await historySummary();
          if (after.pomodoroCount > before.pomodoroCount) break;
        }

        expect(after.pomodoroCount - before.pomodoroCount).toBe(1);
      },
      WAIT_FOR_FOCUS_MS + 10_000,
    );

    // เปิด SSE ก่อน start แล้วรับเฉพาะ event ที่เกิดหลังกด start
    it(
      "IT-04 Timer จบแล้วมี Notification",
      async () => {
        const stream = await openSse(`${URLS.notify}/api/notify/stream`);
        try {
          const startedAt = Date.now();
          const started = await api("POST", `${URLS.timer}/api/timer/start`, { mode: "focus" });
          expect(started.status).toBe(200);

          const event = await stream.waitFor(
            (e) => e.type === "timer_end" && Date.parse(e.time) >= startedAt,
            WAIT_FOR_FOCUS_MS,
          );

          expect(event.type).toBe("timer_end");
        } finally {
          stream.close();
        }
      },
      WAIT_FOR_FOCUS_MS + 10_000,
    );
  });
});
