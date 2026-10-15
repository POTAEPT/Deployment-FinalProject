# Project Plan

## ผู้รับผิดชอบ
กรอกชื่อจริงและ GitHub username ให้ครบ (ตารางนี้เป็นค่าตั้งต้น)

| บทบาท | สมาชิก | หน้าที่หลัก |
|---|---|---|
| Project Manager (PM) | _ชื่อ_ | วางแผน ตั้ง repo / Secrets / Project board, ติดตามงาน, ดูแล release |
| Tester | _ชื่อ_ | Test Spec, API + integration test (Vitest ใน `tests/`), job `integration-tests` ใน CI |
| Developer | ทุกคน | เขียน service ของตัวเอง + Unit test (Vitest) + Dockerfile + pipeline ของตัวเอง |

| Service | เจ้าของ | Parent issue |
|---|---|---|
| auth-service | _Potae_ | #1 |
| timer-service | _IQ_ | #2 |
| task-service | _Dew_ | #3 |
| history-service | _Mon_ | #4 |
| notification-service | _Aom_ | #5 |
| frontend | ทุกคนช่วยกัน (แบ่งหน้าตามความเหมาะสม) | - |

ทุกคนต้องอธิบายส่วนของตัวเองได้ (service, test, pipeline) และมีภาพรวมของระบบ

## เฟสการทำงาน

| เฟส | งาน | ผลลัพธ์ที่ต้องได้ | กำหนด |
|---|---|---|---|
| 0. เตรียมการ | สร้าง repo + โครงโฟลเดอร์, Project board, Docker Hub + Secrets, ตกลง API contract | repo พร้อมใช้, `docs/api-contract.md` ยืนยันแล้ว | _TBD_ |
| 1. Backend | แต่ละคนทำ service ของตัวเอง (API + Unit test) | ทุก service รันได้และ `npm test` ผ่าน | _TBD_ |
| 2. Container + CI/CD | Dockerfile, workflow ต่อ service, `docker-compose.yml` + healthcheck | PR รัน test อัตโนมัติ, `docker compose up` ขึ้นครบ | _TBD_ |
| 3. Frontend | หน้า Login, Timer, Task, History, Notification | ใช้งานครบ flow บนเบราว์เซอร์ | _TBD_ |
| 4. ทดสอบรวม | API + Integration test ด้วย Vitest (`tests/`) ยิง service จริงที่ยกด้วย docker compose, job `integration-tests` | เคสใน Test Spec ผ่านและรันใน CI ได้ | _TBD_ |
| 5. Release + นำเสนอ | tag `<service>-v1.0.0` ของแต่ละ service และ `frontend-v1.0.0` (เช่น `auth-service-v1.0.0`), ตรวจ image บน Docker Hub, ซ้อม demo | image ครบพร้อม version, ทุกคนอธิบายส่วนตัวเองได้ | _TBD_ |

เฟส 1 และ 3 ทำขนานกันได้ (frontend ใช้ API contract เป็นหลัก ระหว่างรอ service จริงใช้ข้อมูลจำลองไปก่อน)

<!-- ## Deliverables ตามโจทย์

| ข้อกำหนด | ทำอย่างไร | สถานะ |
|---|---|---|
| มี PM / Tester / Developer | ตารางด้านบน | ยังไม่เสร็จ |
| มีหน้า Login | frontend + auth-service | ยังไม่เสร็จ |
| CI/CD เชื่อมกับ remote repo | GitHub Actions แยกต่อ service | ยังไม่เสร็จ |
| Microservice (1 คน 1 service) | 5 service ใน `backend/` | ยังไม่เสร็จ |
| Image ขึ้น Docker Hub + Release version | tag `<service>-vX.Y.Z` | ยังไม่เสร็จ |
| Test Spec ≥ จำนวนสมาชิก | `docs/test-spec.md` (36 เคส) | ยังไม่เสร็จ |
| Unit test ≥ จำนวนสมาชิก | Vitest ≥ 2 เคสต่อ service (10 เคส) | ยังไม่เสร็จ |
| Tester ทำ automation บน pipeline | Vitest API + integration test (`tests/`, 26 เคส) ใน job `integration-tests` | ยังไม่เสร็จ |
| Dev ทำ unit test | Vitest ในโฟลเดอร์ service ตาม Test Spec | ยังไม่เสร็จ |
| ทุกคนอธิบายส่วนของตัวเองได้ | ซ้อมก่อนนำเสนอ | ยังไม่เสร็จ |

> ข้อที่ยังไม่แน่ใจ: ข้อกำหนดเรื่อง "แยก project" ในโจทย์ ตอนนี้ทีมเลือก monorepo (1 repo, แยกโฟลเดอร์ + pipeline + image + version ต่อ service) ควรยืนยันกับอาจารย์ ถ้าอาจารย์ต้องการแยก repo ต่อ service ต้องย้ายโฟลเดอร์ใน `backend/` ออกเป็น repo ละตัว -->

## Milestone และ Issue
- Milestone เดียว: `Pomodoro`
- Parent issue ต่อ service (#1 ถึง #5) มี sub-issue 3 ข้อ: ทำ API, เขียน Unit test, Dockerfile + CI/CD + Release (Timer มีเพิ่ม: เรียก History/Notification เมื่อเวลาหมด)
<!-- - ติดตามความคืบหน้าที่ GitHub Project board (Todo / In progress / Review / Done) -->

<!-- ## ความเสี่ยง

| ความเสี่ยง | ผลกระทบ | วิธีรับมือ |
|---|---|---|
| API ไม่ตรงกันระหว่างคน | เชื่อมต่อกันไม่ได้ตอนท้าย | ยึด `api-contract.md`, แก้ผ่าน PR + แจ้งทีม |
| คนใดคนหนึ่งทำช้า | ระบบไม่ครบ | เช็คความคืบหน้ากลางสัปดาห์, ช่วยกันเมื่อมีใครติด |
| Docker/CI ตั้งค่ายาก | pipeline ไม่ผ่านตอนใกล้ส่ง | ทำ service ตัวอย่าง (auth) ให้ผ่านก่อน แล้วให้คนอื่นก๊อปไฟล์ |
| conflict ใน Git | เสียเวลาแก้ | แยกโฟลเดอร์ตาม service, merge main เข้า branch บ่อยๆ |
| ข้อมูลหายเมื่อ restart (ไม่มี DB) | ข้อมูลทดสอบหาย | test สร้างข้อมูลเองทุกเคส, users อยู่บน volume |
| ตีความ "แยก project" ไม่ตรงกับอาจารย์ | ต้องแยก repo ทีหลัง | ถามอาจารย์ตั้งแต่ต้นเฟส 0 |

## ต้องตัดสินใจ/ถามเพิ่ม
- [ ] วัน deadline แต่ละเฟส และวันนำเสนอ
- [ ] ยืนยันกับอาจารย์เรื่อง monorepo
- [ ] ชื่อ Docker Hub account/organization ของทีม
- [ ] แบ่งใครเป็น PM / Tester และใครรับ service ไหน
- [ ] เลือกว่า Test Spec ฉบับหลักคือ `docs/test-spec.md` หรือไฟล์ xlsx (ยึดอันเดียว) -->