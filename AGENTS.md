# AGENTS.md

คำแนะนำสำหรับ AI Agent ที่ทำงานใน repo นี้ (Pomodoro Timer แบบ microservices งานกลุ่มมหาวิทยาลัย) อ่านไฟล์นี้ก่อนแก้ไฟล์ใดๆ

## โปรเจกต์นี้คืออะไร
เว็บ Pomodoro Timer แบ่งเป็น 5 backend service + 1 frontend อยู่ใน repo เดียว (monorepo) สมาชิกแต่ละคนรับผิดชอบ 1 service ทุกคนต้องอธิบายโค้ดของตัวเองได้ จึงควรเขียนให้ **อ่านง่ายและอธิบายได้** มากกว่าเขียนให้สั้นหรือฉลาด

| ส่วน | โฟลเดอร์ | Port |
|---|---|---|
| Auth (สมัคร / Login ออก JWT) | `backend/auth-service` | 3001 |
| Timer (จับเวลา คำนวณ `endTime`) | `backend/timer-service` | 3002 |
| Task (รายการงาน) | `backend/task-service` | 3003 |
| History (สรุปรอบและเวลาโฟกัส) | `backend/history-service` | 3004 |
| Notification (แจ้งเตือนผ่าน SSE) | `backend/notification-service` | 3005 |
| Frontend (React + Vite) | `frontend` | 5173 (dev), 8080 (Docker) |

Stack: Node.js 22 + Express + TypeScript (backend), React + Vite + TypeScript + Tailwind CSS v4 (frontend), Vitest (unit test), Vitest + supertest (API test ในโฟลเดอร์ของ service), Vitest (integration test ข้าม service ในโฟลเดอร์ `tests/`)

## เอกสารที่ต้องอ่านก่อนเขียนโค้ด (แหล่งความจริง)
อย่าเดา ให้อ่านไฟล์เหล่านี้ใน `docs/` และ **ทำตามเอกสาร** ถ้าเอกสารกับโค้ดขัดกัน ให้บอกผู้ใช้แทนที่จะเลือกเอง

| เรื่อง | ไฟล์ |
|---|---|
| endpoint, request/response JSON, status code, env variables | `docs/api-contract.md` |
| เคสทดสอบของทุก service | `docs/test-spec.md` |
| สี ฟอนต์ ปุ่ม และ component ของ UI | `docs/design-system.md` |
| ขั้นตอน Git, ตั้งชื่อ branch/commit/PR/tag | `docs/git-workflow.md` |
| โครงสร้างระบบ และการทำงานภายใน | `docs/architecture.md`, `docs/system-design.md` |
| ขอบเขตโปรเจกต์ และแผนงาน | `docs/project-overview.md`, `docs/project-plan.md` |

## คำสั่งที่ใช้บ่อย
รันในโฟลเดอร์ของ service หรือ `frontend/` นั้นๆ

```bash
npm install      # ติดตั้ง dependency
npm run dev      # รันตอนพัฒนา (รีสตาร์ทเองเมื่อแก้โค้ด)
npm test         # รัน unit test (Vitest)
npm run build    # build เป็น JavaScript ในโฟลเดอร์ dist/
```

ค่าตั้งต้นตอนพัฒนา: ก๊อป `.env.example` เป็น `.env` (`JWT_SECRET=dev-secret` ใช้ค่าเดียวกันทั้ง Auth และ Task)
รันทั้งระบบด้วย Docker: `docker compose up -d --build --wait` ที่ root (เมื่อมี `docker-compose.yml` แล้ว)

## กฎที่ห้ามฝ่าฝืน
1. **ห้าม push ตรงเข้า `main`** ให้แตก branch ชื่อ `feature/<เลข issue>-<ชื่อสั้น>` แล้วเปิด Pull Request (หนึ่ง sub-issue = หนึ่ง branch = หนึ่ง PR เข้า `main`) ใส่ `Closes #<เลข issue>` ใน PR
2. **ห้ามใช้ Database จริง** (SQL, Mongo, SQLite ฯลฯ) อาจารย์ไม่ให้ทำ
   - Auth: เก็บ users เป็นไฟล์ JSON บน Docker volume (path จาก env `USERS_FILE`)
   - Timer / Task / History / Notification: เก็บใน memory ของโปรแกรม ข้อมูลหายตอน restart ถือว่าปกติ
   - ถ้าจะให้ service อื่นเก็บถาวร ต้องถามผู้ใช้ก่อน เพราะต้องเพิ่ม volume ใน `docker-compose.yml`
3. **ห้าม commit ความลับและไฟล์สร้างขึ้น:** `.env`, `node_modules/`, `dist/`, `data/users.json` (แต่ `.env.example` และ `package-lock.json` ต้อง commit)
4. **ห้ามเปลี่ยน API contract เอง** (ชื่อ endpoint, ชื่อ field, status code) ถ้าจำเป็นต้องเปลี่ยน ให้แก้ `docs/api-contract.md` และ `docs/test-spec.md` ใน PR เดียวกัน แล้วบอกผู้ใช้ให้แจ้งทีม
5. **ห้ามแก้ไฟล์กลางโดยไม่ถามก่อน:** `docker-compose.yml`, `.github/workflows/` ของ service อื่น, `docs/`, `.gitignore`, ไฟล์กลางของ frontend (`frontend/src/App.tsx`, `main.tsx`, `index.css`, `pages/`, `components/ui/`, `lib/`, `frontend/package.json` / `package-lock.json`) และโฟลเดอร์ของ service ที่ไม่ใช่ของผู้ใช้ ถ้าจำเป็นให้บอกผู้ใช้ก่อน
   - **`docker-compose.yml`:** เจ้าของ service ไม่ต้องแก้เอง Potae (เต้) เป็นคนเพิ่ม block ของ service ให้ หลังจาก Dockerfile ของ service นั้น merge เข้า `main` แล้ว (ทำเป็น PR เล็กๆ ต่อหนึ่ง service)
   - **frontend:** แต่ละคนแก้ได้เฉพาะโฟลเดอร์ของตัวเองใน `frontend/src/components/` (`timer/`, `task/`, `history/`, `notification/`) ไฟล์กลางของ frontend ต้องแจ้ง Potae ก่อน (กติกาเต็มอยู่ใน issue #23 และ `frontend/README.md`)
6. **ห้ามใส่ secret จริง** (เช่น Docker Hub token) ลงในไฟล์ใดๆ ใช้ GitHub Secrets เท่านั้น

## ข้อตกลงโค้ด
- **Backend:** ทุก service ต้องมี `GET /health` ตอบ `{"status":"ok"}` และ error ทุกตัวตอบรูปแบบ `{"status":"error","message":"..."}` ตามตารางใน `docs/api-contract.md`
- **โครงสร้างไฟล์ใน service:** แยก `src/app.ts` (สร้างแอป) ออกจาก `src/index.ts` (เปิด port) และแยก logic เป็นฟังก์ชันล้วนไว้ในโฟลเดอร์ย่อย (เช่น `utils/` หรือ `lib/`) เพื่อให้ Unit test ได้โดยไม่ต้องเปิดเซิร์ฟเวอร์ ดูตัวอย่างจาก `backend/auth-service`
- **Unit test:** ใช้ Vitest ไฟล์ชื่อ `*.test.ts` ต้องไม่ใช้ network และไม่พึ่ง service อื่น แต่ละ service ต้องมีอย่างน้อย 2 เคสตาม `docs/test-spec.md`
- **API test:** ใช้ Vitest + supertest ยิงเข้า `createApp()` ในโปรเซสเดียวกันได้ (ไม่ต้องเปิด port) แต่ห้ามเรียก service อื่นหรือ network ภายนอก อยู่ในโฟลเดอร์ของ service และรันใน job `test`
- **Integration test:** อยู่ที่ `tests/` ที่ root ใช้ Vitest ยิง `http://localhost:300x` ของ service ที่ยกด้วย `docker compose` (Tester เป็นคนเขียน รันใน job `integration-tests`)
- **Frontend:** ใช้สีและ component ตาม `docs/design-system.md` เท่านั้น ห้ามใส่สี hex ตรงๆ ในโค้ด ให้ใช้ชื่อ token (`bg-focus`, `text-ink` ฯลฯ) ที่ประกาศใน `@theme` ของ `frontend/src/index.css` และต้องออกแบบสถานะ Loading / Error / Empty ของทุกหน้าที่เรียก API
- **Docker:** Dockerfile แบบ multi-stage บน `node:22-alpine` และแต่ละ service ปล่อยเวอร์ชันด้วย git tag `<service>-vX.Y.Z` (เช่น `auth-service-v1.0.0`) ไม่ใช้ tag `v1.0.0` ล้วนๆ
- ใช้ `npm ci` ใน Dockerfile และ CI ดังนั้นต้อง commit `package-lock.json` เสมอ

## วิธีทำงานกับผู้ใช้
- ก่อนเริ่ม ให้ดูว่างานที่ได้รับตรงกับ issue ไหน ถ้าไม่แน่ใจขอบเขต ให้ถามก่อนลงมือ
- แก้เท่าที่ได้รับมอบหมาย อย่าปรับโครงสร้างหรือเปลี่ยนชื่อไฟล์ที่ไม่เกี่ยวข้อง
- อธิบายว่าแก้อะไรและเหตุผล เพราะผู้ใช้ต้องอธิบายโค้ดนี้ให้อาจารย์ได้
- ถ้ารันคำสั่งหรือเทสไม่ได้ ให้บอกตรงๆ อย่าอ้างว่าทดสอบแล้ว
- ห้าม commit หรือ push เอง เว้นแต่ผู้ใช้สั่งชัดเจน