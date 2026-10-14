# API Contract

เอกสารนี้คือ "สัญญา" ระหว่าง service และ frontend ทุกคนต้องทำตามนี้ ถ้าจะเปลี่ยน endpoint หรือ field ให้แก้เอกสารนี้ผ่าน Pull Request และแจ้งทีมก่อน (Test Spec และ Robot test อ้างอิงเอกสารนี้)

## กติกากลาง

| หัวข้อ | ข้อกำหนด |
|---|---|
| Format | JSON ทั้งหมด, header `Content-Type: application/json` |
| Base URL (local) | auth `:3001`, timer `:3002`, task `:3003`, history `:3004`, notification `:3005` |
| Health check | ทุก service มี `GET /health` → `200 {"status":"ok"}` |
| Auth | endpoint ที่ต้อง Login ส่ง header `Authorization: Bearer <token>` |
| CORS | ทุก service เปิด CORS เพื่อให้ frontend เรียกข้าม origin ได้ |
| วันที่/เวลา | ISO 8601 เช่น `2026-01-01T10:25:00.000Z`; วันที่ล้วนใช้ `YYYY-MM-DD` |

### รูปแบบ Error (ทุก service)
```json
{ "status": "error", "message": "คำอธิบายสั้นๆ" }
```

| Status code | ใช้เมื่อ |
|---|---|
| 400 | ข้อมูลที่ส่งมาไม่ครบหรือไม่ถูกต้อง |
| 401 | ไม่มี token, token ผิด/หมดอายุ, หรือรหัสผ่านผิด |
| 404 | ไม่พบข้อมูลที่ระบุ (เช่น task id) |
| 409 | ข้อมูลซ้ำ (เช่น username ซ้ำ) |

---

## 1. Auth Service (port 3001)

### POST /api/auth/register
Request
```json
{ "username": "testuser1", "password": "Passw0rd!" }
```
Response `201`
```json
{ "status": "success", "user": { "username": "testuser1" } }
```
Error: `409` username ซ้ำ, `400` ส่งไม่ครบ

### POST /api/auth/login
Request
```json
{ "username": "testuser1", "password": "Passw0rd!" }
```
Response `200`
```json
{ "status": "success", "user": { "username": "testuser1" }, "token": "<JWT>" }
```
Error: `401` username/password ผิด, `400` ส่งไม่ครบ

หมายเหตุ: JWT มี payload `username`, อายุ 1 ชั่วโมง, เซ็นด้วย `JWT_SECRET`

---

## 2. Timer Service (port 3002)

ค่า `status` ของ timer มี 3 ค่า: `idle` | `running` | `paused`
ค่า `mode`: `focus` (1500 วินาที) | `short_break` (300) | `long_break` (900)

### POST /api/timer/start
Request
```json
{ "mode": "focus" }
```
Response `200`
```json
{ "status": "running", "mode": "focus", "timeLeft": 1500, "endTime": "2026-01-01T10:25:00.000Z" }
```
Error: `400` mode ไม่ถูกต้อง

### POST /api/timer/pause
Response `200` (ไม่ต้องมี body)
```json
{ "status": "paused", "mode": "focus", "timeLeft": 1230, "endTime": null }
```
Error: `400` ถ้า timer ไม่ได้อยู่ในสถานะ running

### POST /api/timer/resume
Response `200` — `endTime` คำนวณใหม่จาก `timeLeft` ที่ค้างไว้
```json
{ "status": "running", "mode": "focus", "timeLeft": 1230, "endTime": "2026-01-01T10:25:00.000Z" }
```
Error: `400` ถ้าไม่ได้อยู่ในสถานะ paused

### POST /api/timer/reset
Response `200` — กลับค่าเริ่มต้นของ mode ปัจจุบัน
```json
{ "status": "idle", "mode": "focus", "timeLeft": 1500, "endTime": null }
```

### GET /api/timer/status
Response `200` รูปแบบเดียวกับข้างบน (frontend ใช้ตอนรีเฟรชหน้า)

### เมื่อเวลาหมด (Timer เรียก service อื่นเอง)
- ถ้า mode = `focus` → `POST {HISTORY_URL}/api/history` ส่ง `{ "focusMin": 25 }`
- ทุก mode → `POST {NOTIFY_URL}/api/notify` ส่ง `{ "type": "timer_end" }`
- ถ้า service ปลายทางล่มหรือยังไม่ตั้ง URL ต้องไม่ทำให้ Timer พัง

เวลาเริ่มต้นปรับได้ด้วย env `FOCUS_SECONDS`, `SHORT_BREAK_SECONDS`, `LONG_BREAK_SECONDS` (ใช้ตั้งเป็น 1 ตอนทดสอบ)

---

## 3. Task Service (port 3003) — ทุก endpoint ต้องมี token

### GET /api/tasks
Response `200`
```json
{ "status": "success", "tasks": [ { "id": "1", "title": "อ่านหนังสือ", "completed": false } ] }
```

### POST /api/tasks
Request
```json
{ "title": "อ่านหนังสือ" }
```
Response `201`
```json
{ "status": "success", "task": { "id": "1", "title": "อ่านหนังสือ", "completed": false } }
```
Error: `400` title ว่าง

### PATCH /api/tasks/:id
Request (ส่งอย่างใดอย่างหนึ่งหรือทั้งคู่)
```json
{ "completed": true, "title": "ชื่อใหม่" }
```
Response `200` ส่ง task หลังแก้ไข, Error: `404` ไม่พบ id

### DELETE /api/tasks/:id
Response `200` `{ "status": "success" }`, Error: `404` ไม่พบ id

ไม่มี token หรือ token ผิด → `401 {"status":"error","message":"unauthorized"}`
แต่ละผู้ใช้เห็นเฉพาะ task ของตัวเอง (แยกตาม `username` ใน token)

---

## 4. History Service (port 3004)

### POST /api/history
Request (`date` ไม่ส่งก็ได้ ใช้วันนี้)
```json
{ "focusMin": 25, "date": "2026-01-01" }
```
Response `201` `{ "status": "success" }`
Error: `400` focusMin ไม่ใช่ตัวเลขหรือ ≤ 0

### GET /api/history/summary?date=2026-01-01
Response `200`
```json
{ "status": "success", "date": "2026-01-01", "pomodoroCount": 2, "totalFocusMin": 50 }
```
- วันที่ไม่มีข้อมูล → `200` ค่า `pomodoroCount` และ `totalFocusMin` เป็น 0 (ไม่ใช่ 404)
- ไม่ส่ง `date` → ใช้วันนี้, รูปแบบ date ผิด → `400`

---

## 5. Notification Service (port 3005)

ค่า `type` ที่รองรับ: `focus_end` | `break_end` | `timer_end`

| type | message เริ่มต้น |
|---|---|
| `focus_end` | หมดเวลาโฟกัสแล้ว พักได้เลย |
| `break_end` | หมดเวลาพักแล้ว กลับมาโฟกัสกัน |
| `timer_end` | หมดเวลา! |

### POST /api/notify
Request (`message` ไม่ส่งก็ได้ ใช้ข้อความเริ่มต้นตาม type)
```json
{ "type": "timer_end" }
```
Response `200`
```json
{ "status": "success", "type": "timer_end", "message": "หมดเวลา!", "time": "2026-01-01T10:25:00.000Z" }
```
Error: `400` type ไม่รู้จัก

### GET /api/notify/stream (SSE)
- Response header: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- ทุกครั้งที่มี `POST /api/notify` server ส่ง event ไปทุก client ที่เชื่อมอยู่:
```
data: {"type":"timer_end","message":"หมดเวลา!","time":"2026-01-01T10:25:00.000Z"}

```
(ต้องมีบรรทัดว่างปิดท้าย 1 บรรทัดตามรูปแบบ SSE)

---

## Environment variables

| Variable | ใช้ใน | ค่าเริ่มต้น | ความหมาย |
|---|---|---|---|
| `PORT` | ทุก service | 300x ตามตาราง | port ที่เปิด |
| `JWT_SECRET` | auth, task | ในเครื่องใช้ `dev-secret` (ตั้งผ่านไฟล์ `.env` ที่ก๊อปจาก `.env.example`), บน Docker ตั้งใน `docker-compose.yml` | ต้องเป็นค่าเดียวกันทั้งสองตัว |
| `USERS_FILE` | auth | `./data/users.json` | path ไฟล์เก็บ users (อยู่บน Docker volume) |
| `HISTORY_URL` | timer | `http://history-service:3004` | ปลายทางบันทึกประวัติ |
| `NOTIFY_URL` | timer | `http://notification-service:3005` | ปลายทางแจ้งเตือน |
| `FOCUS_SECONDS` ฯลฯ | timer | 1500 / 300 / 900 | ปรับเวลาตอนเทส |