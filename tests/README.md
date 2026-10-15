# tests: API + Integration test

เทสต์ที่ยิง HTTP ไปที่ service จริงซึ่งยกด้วย `docker compose` ใช้ Vitest + `fetch` ของ Node 22 (Tester เป็นคนดูแล)
รันอัตโนมัติใน job `integration-tests` (`.github/workflows/integration-tests.yml`)

| ไฟล์ | เคสใน `docs/test-spec.md` |
|---|---|
| `auth.test.ts` | TS-01-01, 02, 03, 04, 07 |
| `timer.test.ts` | TS-02-01, 02, 03, 04, 07 |
| `task.test.ts` | TS-03-01, 02, 03, 04, 07 |
| `history.test.ts` | TS-04-01, 02, 03, 06 |
| `notification.test.ts` | TS-05-01, 02, 05 |
| `integration.test.ts` | IT-01, 02, 03, 04 |
| `helpers.ts` | URL ของ service, ยิง API, สร้าง user, reset timer, อ่าน SSE |

ชื่อเทสต์ขึ้นต้นด้วย Test ID เทียบกับ test-spec ได้ทันที ส่วน unit test อยู่ในโฟลเดอร์ของแต่ละ service

## วิธีรันในเครื่อง

```bash
# ที่ root: ยก backend โดยให้ focus สั้น 3 วินาที (ค่าเดียวกับ CI)
FOCUS_SECONDS=3 docker compose up -d --build --wait auth-service timer-service task-service history-service notification-service

# รันเทสต์ (ต้องใช้ FOCUS_SECONDS ค่าเดียวกัน เพราะ TS-02-01 คาดหวังค่านี้)
cd tests
npm ci
FOCUS_SECONDS=3 npm test
```

รันซ้ำได้เลยโดยไม่ต้องลบข้อมูล ปิดระบบด้วย `docker compose down`

## หลักที่ใช้เขียน
- **ข้อมูลไม่ซ้ำทุกรอบ:** username เป็น `testuser1-<suffix>`, history ใช้วันที่สุ่มในอดีต, notification ใช้ message ไม่ซ้ำ
- **เทียบก่อน/หลัง (delta):** ไม่คาดว่าข้อมูลเริ่มที่ 0 และไม่พึ่งลำดับของไฟล์
- **timer มีตัวเดียวทั้งระบบ:** รันทีละไฟล์ (`fileParallelism: false`) และ reset timer ก่อน/หลังทุกเคส
- **pause / resume / reset ใช้ `long_break`:** focus ใน CI สั้นมาก จะจบก่อนกด pause
- **URL เปลี่ยนได้ด้วย env:** `AUTH_URL`, `TIMER_URL`, `TASK_URL`, `HISTORY_URL`, `NOTIFY_URL` (ค่าเริ่มต้น `http://localhost:300x`)
