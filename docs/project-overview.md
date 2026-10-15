# Project Overview

## โปรเจกต์นี้คืออะไร
**Pomodoro Timer** เว็บแอปจับเวลาตามเทคนิค Pomodoro (โฟกัส 25 นาที สลับพัก) อ้างอิงหน้าตาและฟีเจอร์จาก [pomofocus.io](https://pomofocus.io/) สร้างเป็น **microservices** เพื่อเป็นงานกลุ่มวิชา "วางโครงโปรเจกต์และ Deploy ระบบ" ซึ่งเน้นกระบวนการทำงานเป็นทีมและการ Deploy มากกว่าความซับซ้อนของแอป

## เป้าหมาย
1. ทำเว็บ Pomodoro ที่ใช้งานได้จริง (Login, จับเวลา, จัดการงาน, ดูประวัติ, แจ้งเตือน)
2. แบ่งเป็น microservices ให้แต่ละคนในทีม (5 คน) รับผิดชอบ 1 service
3. มี CI/CD อัตโนมัติ (test ทุก PR, build และส่ง Docker image ขึ้น Docker Hub พร้อม version)
4. มี Test Spec, Unit test และ automation test ที่รันใน pipeline
5. ทุกคนอธิบายส่วนของตัวเองได้

## ฟีเจอร์

| ฟีเจอร์ | รายละเอียด | Service |
|---|---|---|
| Login / สมัครสมาชิก | ยืนยันตัวตนด้วย JWT | auth |
| จับเวลา | โหมด focus / short break / long break, start / pause / resume / reset | timer |
| จัดการงาน (Task) | เพิ่ม ดู ติ๊กเสร็จ ลบ | task |
| ประวัติ | จำนวนรอบ Pomodoro และเวลาโฟกัสรวมรายวัน | history |
| แจ้งเตือน | เมื่อหมดเวลา แสดง toast + เสียงบนเว็บ (ไม่ทำ mobile) | notification |
| หน้าเว็บ | รวมทุกฟีเจอร์ในหน้าเดียว | frontend |

### อยู่นอกขอบเขต (ไม่ทำ)
- Database จริง (อาจารย์ไม่บังคับ: เก็บเฉพาะ users ของ Login เป็นไฟล์ JSON บน Docker volume)
- Mobile app / push notification
- UI automation (E2E ด้วย browser) ทดสอบเฉพาะ API ด้วย Vitest
- ระบบชำระเงิน/ธีมเสริม/สถิติรายสัปดาห์แบบ pomofocus เต็มรูปแบบ

## Services (สรุปสั้น)

| Service | Port | หน้าที่ |
|---|---|---|
| auth-service | 3001 | สมัคร / Login ออก JWT |
| timer-service | 3002 | จับเวลา คำนวณ `endTime` |
| task-service | 3003 | รายการงาน |
| history-service | 3004 | สรุปรอบและเวลาโฟกัส |
| notification-service | 3005 | ส่งแจ้งเตือนผ่าน SSE |
| frontend | 8080 | UI |

ภาพรวมทางเทคนิคดูที่ [architecture.md](architecture.md) และ [system-design.md](system-design.md)

## Tech Stack
React + Vite + TypeScript + Tailwind (frontend) · Node.js 22 + Express + TypeScript (backend) · Vitest (unit test, API test และ integration test) · Docker + docker compose · GitHub Actions · Docker Hub

## วิธีทำงานของทีม
- GitHub Flow: Issue → branch → Pull Request → review → Squash merge (ดู [git-workflow.md](git-workflow.md))
- 1 repo (monorepo) แยกโฟลเดอร์ต่อ service แต่ละ service มี pipeline, Docker image และ version ของตัวเอง
- งานทั้งหมดติดตามที่ GitHub Issues และ Milestone `Pomodoro` (ดู [project-plan.md](project-plan.md))

## เอกสารในโฟลเดอร์ docs

| ไฟล์ | เนื้อหา |
|---|---|
| [project-overview.md](project-overview.md) | ภาพรวมโปรเจกต์ (ไฟล์นี้) |
| [project-plan.md](project-plan.md) | ผู้รับผิดชอบ เฟส Milestone และ Issue |
| [architecture.md](architecture.md) | โครงสร้างระบบ service, port, โครงโฟลเดอร์, tech stack |
| [system-design.md](system-design.md) | การทำงานภายใน flow, การเก็บข้อมูล, pipeline |
| [api-contract.md](api-contract.md) | endpoint และรูปแบบ JSON ของทุก service |
| [git-workflow.md](git-workflow.md) | ขั้นตอนทำงานด้วย Git/GitHub และการ release |
| [test-spec.md](test-spec.md) | รายการเคสทดสอบทุก service |

## วิธีรันทั้งระบบในเครื่อง (เมื่อพร้อมแล้ว)
```bash
docker compose up -d --build --wait
```
- `docker compose up`: สร้างและเริ่ม container ทุกตัวตามที่เขียนใน `docker-compose.yml`
- `-d`: รันเบื้องหลัง (detached) ไม่ค้าง terminal
- `--build`: build image ใหม่จากโค้ดล่าสุดก่อนรัน
- `--wait`: รอจนทุก container ผ่าน healthcheck (`/health`) ค่อยจบคำสั่ง

เปิดเว็บที่ http://localhost:8080 ปิดระบบด้วย `docker compose down`