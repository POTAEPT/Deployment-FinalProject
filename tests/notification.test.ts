import { describe, expect, it } from "vitest";
import { api, openSse, uniqueSuffix, URLS } from "./helpers";

const NOTIFY = `${URLS.notify}/api/notify`;

describe("TS-05 Notification", () => {
  it("TS-05-01 ส่ง event แจ้งเตือนผ่าน API", async () => {
    const result = await api("POST", NOTIFY, { type: "timer_end", message: "หมดเวลา!" });

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("success");
  });

  // ส่ง message ที่ไม่ซ้ำ แล้วรอเฉพาะ event นั้น (ไม่สนใจ event อื่นที่อาจเข้ามาพร้อมกัน)
  it("TS-05-02 Client รับ event ผ่าน SSE", async () => {
    const stream = await openSse(`${NOTIFY}/stream`);
    try {
      const message = `หมดเวลา! ${uniqueSuffix()}`;
      const sent = await api("POST", NOTIFY, { type: "timer_end", message });
      expect(sent.status).toBe(200);

      const event = await stream.waitFor((e) => e.message === message, 5_000);

      expect(event.type).toBe("timer_end");
      expect(event.message).toBe(message);
      expect(event.time).toBe(sent.body.time);
    } finally {
      stream.close();
    }
  });

  it("TS-05-05 ส่ง type ไม่ถูกต้องผ่าน API", async () => {
    const result = await api("POST", NOTIFY, { type: "abc" });

    expect(result.status).toBe(400);
    expect(result.body.status).toBe("error");
  });
});
