# Test Spec – Pomodoro Timer (Microservices)

เอกสารนี้คือ Test Spec ของทุก service อัปเดตสถานะ (Status) ผ่าน Pull Request

## วิธีอ่าน

- **Type:** Unit = Vitest (Dev เขียน รันใน CI) | API = Robot Framework ยิง HTTP จริง | Integration = Robot ยิงข้าม service
- **Status:** `Not Run` / `Pass` / `Fail`
- **Test ID:** `TS-01-01` = service ที่ 01 (Auth) เคสที่ 01, `IT-01` = Integration test
- Endpoint และ field เป็นค่าตั้งต้น ให้ตรงกับ API contract ของทีม

## สารบัญ

- [TS-01 Auth](#ts-01-auth)
- [TS-02 Timer](#ts-02-timer)
- [TS-03 Task](#ts-03-task)
- [TS-04 History](#ts-04-history)
- [TS-05 Notification](#ts-05-notification)
- [Integration](#integration)

## TS-01 Auth

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TS-01-01 | API | Register | สมัครสมาชิกสำเร็จ | ไม่มี user นี้ในระบบ | 1. POST /api/auth/register<br>2. ตรวจ response | username=testuser1, password=Passw0rd! | HTTP 201, status=success, มี user.username ตรงกับที่ส่ง | Robot | Member 1 | Not Run |  |
| TS-01-02 | API | Register | สมัครด้วย username ซ้ำ | มี testuser1 อยู่แล้ว | 1. POST /api/auth/register ซ้ำด้วย username เดิม | username=testuser1 | HTTP 409, status=error, มี message แจ้งว่าซ้ำ | Robot | Member 1 | Not Run |  |
| TS-01-03 | API | Login | Login สำเร็จ ได้ token | มี testuser1 อยู่แล้ว | 1. POST /api/auth/login<br>2. ตรวจ token | username=testuser1, password=Passw0rd! | HTTP 200, status=success, token ไม่ว่าง | Robot | Member 1 | Not Run |  |
| TS-01-04 | API | Login | Login รหัสผ่านผิด | มี testuser1 อยู่แล้ว | 1. POST /api/auth/login ด้วยรหัสผิด | password=wrong | HTTP 401, status=error, ไม่มี token | Robot | Member 1 | Not Run |  |
| TS-01-05 | Unit | Password | hash รหัสผ่านด้วย bcrypt | - | 1. เรียกฟังก์ชัน hashPassword('Passw0rd!')<br>2. ตรวจผล | plain=Passw0rd! | ผลลัพธ์ไม่เท่ากับ plain และ comparePassword ให้ true | Vitest | Member 1 | Pass | `backend/auth-service/src/lib/password.test.ts` |
| TS-01-06 | Unit | Token | ตรวจ JWT ที่หมดอายุ/ปลอม | - | 1. สร้าง token ปลอม<br>2. เรียก verifyToken | token=abc.def.ghi | verifyToken throw error / คืน null | Vitest | Member 1 | Pass | `backend/auth-service/src/lib/token.test.ts` (ทดสอบทั้ง token ปลอมและหมดอายุ) |
| TS-01-07 | API | Validation | Login โดยไม่ส่ง password | - | 1. POST /api/auth/login เฉพาะ username | username=testuser1 | HTTP 400, status=error | Robot | Member 1 | Not Run |  |

## TS-02 Timer

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TS-02-01 | API | Start | เริ่ม Pomodoro (focus 25 นาที) | - | 1. POST /api/timer/start mode=focus | mode=focus | HTTP 200, status=running, timeLeft=1500, มี endTime | Robot | Member 2 | Not Run |  |
| TS-02-02 | API | Start | เริ่มโหมด short break | - | 1. POST /api/timer/start mode=short_break | mode=short_break | HTTP 200, timeLeft=300 | Robot | Member 2 | Not Run |  |
| TS-02-03 | API | Pause/Resume | Pause แล้ว Resume | Timer กำลังทำงาน | 1. POST /api/timer/pause<br>2. POST /api/timer/resume | - | pause: status=paused และ timeLeft ค้างค่า; resume: status=running และ endTime ใหม่ | Robot | Member 2 | Not Run |  |
| TS-02-04 | API | Reset | Reset timer | Timer กำลังทำงาน | 1. POST /api/timer/reset | - | status=idle, timeLeft กลับเป็นค่าเริ่มต้นของโหมด | Robot | Member 2 | Not Run |  |
| TS-02-05 | Unit | Calc | คำนวณ endTime | - | 1. เรียก calcEndTime(now, 1500) | now=2026-01-01T10:00:00Z | คืน 2026-01-01T10:25:00Z | Vitest | Member 2 | Not Run |  |
| TS-02-06 | Unit | Calc | คำนวณ timeLeft ไม่ติดลบ | - | 1. เรียก calcTimeLeft(endTime ที่ผ่านไปแล้ว) | endTime อดีต | คืน 0 ไม่ใช่ค่าติดลบ | Vitest | Member 2 | Not Run |  |
| TS-02-07 | API | Validation | mode ไม่ถูกต้อง | - | 1. POST /api/timer/start mode=xyz | mode=xyz | HTTP 400, status=error | Robot | Member 2 | Not Run |  |

## TS-03 Task

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TS-03-01 | API | Create | เพิ่ม task ใหม่ | Login แล้ว มี token | 1. POST /api/tasks พร้อม Authorization<br>2. ตรวจ response | title=อ่านหนังสือ | HTTP 201, task มี id, completed=false | Robot | Member 3 | Not Run |  |
| TS-03-02 | API | List | ดึงรายการ task | มี task 1 รายการ | 1. GET /api/tasks | - | HTTP 200, tasks เป็น array และมี task ที่สร้าง | Robot | Member 3 | Not Run |  |
| TS-03-03 | API | Update | ติ๊ก task ว่าเสร็จ | มี task อยู่ | 1. PATCH /api/tasks/{id} completed=true | completed=true | HTTP 200, completed=true | Robot | Member 3 | Not Run |  |
| TS-03-04 | API | Delete | ลบ task | มี task อยู่ | 1. DELETE /api/tasks/{id}<br>2. GET /api/tasks | - | HTTP 200 พร้อม {"status":"success"} และ task หายจากรายการ | Robot | Member 3 | Not Run |  |
| TS-03-05 | Unit | Validation | title ว่างต้องถูกปฏิเสธ | - | 1. เรียก validateTitle('') | title='' | คืน false / throw error | Vitest | Member 3 | Not Run |  |
| TS-03-06 | Unit | Logic | toggle สถานะ completed | - | 1. เรียก toggleTask(task ที่ completed=false) | completed=false | ผลลัพธ์ completed=true | Vitest | Member 3 | Not Run |  |
| TS-03-07 | API | Auth | เรียกโดยไม่มี token | - | 1. GET /api/tasks ไม่ใส่ Authorization | - | HTTP 401 | Robot | Member 3 | Not Run |  |

## TS-04 History

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TS-04-01 | API | Record | บันทึก pomodoro ที่เสร็จ | - | 1. POST /api/history ส่ง focusMin | focusMin=25 | HTTP 201, status=success | Robot | Member 4 | Not Run |  |
| TS-04-02 | API | Summary | ดูสรุปรายวัน | บันทึกไว้ 2 ครั้ง ครั้งละ 25 | 1. GET /api/history/summary?date=... | date=2026-01-01 | pomodoroCount=2, totalFocusMin=50 | Robot | Member 4 | Not Run |  |
| TS-04-03 | API | Summary | วันที่ไม่มีข้อมูล | - | 1. GET /api/history/summary วันที่ว่าง | date=2000-01-01 | pomodoroCount=0, totalFocusMin=0 | Robot | Member 4 | Not Run |  |
| TS-04-04 | Unit | Calc | รวม focus minutes | - | 1. เรียก sumFocusMin([25,25,15]) | [25,25,15] | คืน 65 | Vitest | Member 4 | Not Run |  |
| TS-04-05 | Unit | Format | จัดรูปแบบวันที่เป็น ISO | - | 1. เรียก formatDate(Date) | 2026-01-01T10:00:00Z | คืน '2026-01-01' | Vitest | Member 4 | Not Run |  |
| TS-04-06 | API | Validation | focusMin ติดลบ | - | 1. POST /api/history focusMin=-5 | focusMin=-5 | HTTP 400, status=error | Robot | Member 4 | Not Run |  |

## TS-05 Notification

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TS-05-01 | API | Event | ส่ง event แจ้งเตือนผ่าน API | - | 1. POST /api/notify type=timer_end | type=timer_end, message=หมดเวลา! | HTTP 200, status=success | Robot | Member 5 | Not Run |  |
| TS-05-02 | API | Stream | Client รับ event ผ่าน SSE | เปิด connection /api/notify/stream | 1. เปิด SSE<br>2. POST /api/notify<br>3. อ่าน event | type=timer_end | ได้ event ที่มี type, message, time ตรงกับที่ส่ง | Robot | Member 5 | Not Run |  |
| TS-05-03 | Unit | Message | สร้างข้อความตามประเภท | - | 1. เรียก buildMessage('focus_end') | type=focus_end | คืนข้อความ 'หมดเวลาโฟกัสแล้ว พักได้เลย' (หรือที่ทีมกำหนด) | Vitest | Member 5 | Not Run |  |
| TS-05-04 | Unit | Validation | type ไม่รู้จักต้องถูกปฏิเสธ | - | 1. เรียก isValidType('abc') | type=abc | คืน false | Vitest | Member 5 | Not Run |  |
| TS-05-05 | API | Validation | ส่ง type ไม่ถูกต้องผ่าน API | - | 1. POST /api/notify type=abc | type=abc | HTTP 400, status=error | Robot | Member 5 | Not Run |  |

## Integration

| Test ID | Type | Feature | Test Case | Precondition | Steps | Test Data | Expected Result | Tool | Owner | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| IT-01 | Integration | Auth ↔ Task | ใช้ token จาก Auth สร้าง task | Auth และ Task ทำงานอยู่ | 1. Login ที่ Auth ได้ token<br>2. POST /api/tasks ด้วย token นั้น | testuser1 | Task Service ยอมรับ token และสร้าง task ได้ (201) | Robot | ทั้งทีม | Not Run |  |
| IT-02 | Integration | Auth ↔ Task | token ปลอมถูก Task ปฏิเสธ | Auth และ Task ทำงานอยู่ | 1. POST /api/tasks ด้วย token ปลอม | token=fake | HTTP 401 | Robot | ทั้งทีม | Not Run |  |
| IT-03 | Integration | Timer ↔ History | Timer จบแล้ว History นับเพิ่ม | Timer และ History ทำงานอยู่ | 1. start focus (ย่อเวลาด้วย config ทดสอบ)<br>2. รอจบ<br>3. GET history summary | focus=1 วินาที (test config) | pomodoroCount เพิ่มขึ้น 1 | Robot | ทั้งทีม | Not Run |  |
| IT-04 | Integration | Timer ↔ Notification | Timer จบแล้วมี Notification | Timer และ Notification ทำงานอยู่ | 1. เปิด SSE<br>2. start timer เวลาสั้น<br>3. รอ event | focus=1 วินาที (test config) | ได้ event type=timer_end | Robot | ทั้งทีม | Not Run |  |