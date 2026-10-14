# Frontend

หน้าเว็บ Pomodoro หน้าเดียว (React + Vite + TypeScript + Tailwind CSS v4)
หน้าตาทำตาม [`docs/design-system.md`](../docs/design-system.md) และเรียก API ตาม [`docs/api-contract.md`](../docs/api-contract.md)

## วิธีรัน

```bash
cd frontend
cp .env.example .env    # URL ของแต่ละ service (ค่าเริ่มต้น localhost:300x)
npm install
npm run dev             # เปิด http://localhost:5173
```

ต้องมี backend รันอยู่ด้วย เช่น `docker compose up -d --build --wait` ที่ root
ทดสอบ login ด้วยบัญชี `demo1` / `Passw0rd!`

คำสั่งอื่น: `npm run lint` (ตรวจโค้ด), `npm run build` (build เป็น `dist/`)

## โครงสร้าง

```
src/
├── main.tsx                 # ครอบแอปด้วย AuthProvider
├── App.tsx                  # ยังไม่ login → LoginPage, login แล้ว → HomePage
├── index.css                # @theme (สีและฟอนต์)
├── lib/
│   ├── config.ts            # URL ของแต่ละ service
│   ├── api.ts               # apiFetch + ApiError
│   ├── session.ts           # เก็บ/อ่าน token ใน localStorage
│   ├── auth.tsx             # AuthProvider + useAuth()
│   └── mode.ts              # type Mode + สีตามโหมด
├── pages/
│   ├── LoginPage.tsx
│   └── HomePage.tsx         # วาง component ของทุกคน
└── components/
    ├── ui/                  # ของกลาง: Button, Card, TextField, Loading, ErrorMessage, EmptyState
    ├── timer/TimerCard.tsx          # IQ  #26
    ├── task/TaskList.tsx            # Dew #27
    ├── history/HistorySummary.tsx   # Mon #28
    └── notification/ToastHost.tsx   # #29
```

## กติกา

- แก้เฉพาะโฟลเดอร์ของตัวเองใน `src/components/` สร้างไฟล์ใหม่ในนั้นได้อิสระ

  | โฟลเดอร์ | ไฟล์หลัก (HomePage import ตัวนี้ ห้ามเปลี่ยนชื่อ) | เจ้าของ |
  |---|---|---|
  | `timer/` | `TimerCard.tsx` | IQ |
  | `task/` | `TaskList.tsx` | Dew |
  | `history/` | `HistorySummary.tsx` | Mon |
  | `notification/` | `ToastHost.tsx` | (รอ assign) |
- ไฟล์หลักต้อง `export default` component (ตอนนี้เป็น placeholder อยู่ แก้ทับได้เลย)
- ไฟล์กลาง: `App.tsx`, `main.tsx`, `index.css`, `pages/`, `components/ui/`, `lib/`, `package.json` / `package-lock.json`
  **แจ้ง Potae ก่อนแก้ทุกครั้ง** เพราะมีผลกับหน้าของทุกคน (ส่งข้อความให้ Potae ดูก็พอ ไม่ต้องรอนาน)
- จะลง npm package เพิ่ม แจ้ง Potae ก่อน (กัน `package-lock.json` ชนกัน)
- ถ้าต้องใช้ component เดียวกันกับเพื่อน แจ้ง Potae ให้ย้ายไป `ui/`
- ห้ามใส่สี hex ตรงๆ ใช้ token (`bg-focus`, `text-ink` ฯลฯ) และห้ามประกอบชื่อคลาสด้วยตัวแปร เช่น `` `bg-${mode}` `` (ใช้ `MODE_BG[mode]` แทน)
- ทุก component ที่เรียก API ต้องมี Loading / Error / Empty

## วิธีใช้ของกลาง

### เรียก API: `apiFetch`

```tsx
import { apiFetch, ApiError } from "../../lib/api";
import { TASK_URL } from "../../lib/config";

type TasksResponse = { status: "success"; tasks: { id: string; title: string; completed: boolean }[] };

const data = await apiFetch<TasksResponse>(`${TASK_URL}/api/tasks`);
await apiFetch(`${TASK_URL}/api/tasks`, { method: "POST", body: { title: "อ่านหนังสือ" } });
```

- แนบ `Authorization: Bearer <token>` ให้เองถ้า login อยู่ ไม่ต้องส่ง token เอง
- ถ้า API ตอบ error จะ `throw ApiError` ที่มี `status` และ `message` (ข้อความจาก API เอาไปแสดงได้เลย)
- ต่อ service ไม่ติด (ล่ม/URL ผิด) ได้ `ApiError` ที่ `status = 0`
- ถ้า service ตอบ 401 ระหว่างใช้งาน (token หมดอายุ) ระบบจะ logout และกลับหน้า Login ให้เอง

### ข้อมูลผู้ใช้: `useAuth`

```tsx
import { useAuth } from "../../lib/auth";

const { username, token, logout } = useAuth();
```

### โหมดของ Timer: `lib/mode.ts`

`Mode` = `"focus" | "short_break" | "long_break"` (ตรงกับ timer-service) มี `MODE_LABEL` (ชื่อไทย), `MODE_BG` (สีพื้น), `MODE_TEXT` (สีตัวหนังสือ)
TimerCard เรียก `onModeChange(mode)` แล้ว HomePage จะเปลี่ยนสีพื้นหลังทั้งหน้า

### Component กลาง: `components/ui`

```tsx
import { Button, Card, EmptyState, ErrorMessage, Loading, TextField } from "../ui";
```

| Component | ใช้ยังไง |
|---|---|
| `Button` | `variant="primary"` (ค่าเริ่มต้น, ใส่ `mode` ให้สีตัวหนังสือตามโหมด) / `"secondary"` / `"danger"`, ใส่ `disabled` ได้ |
| `Card` | `variant="solid"` (การ์ดขาว, ค่าเริ่มต้น) / `"glass"` (โปร่งแสงบนพื้นสีโหมด เช่น Timer) |
| `TextField` | `label` (บังคับ), `error` (ข้อความใต้ช่อง) + props ของ `<input>` ทั้งหมด |
| `Loading` | `<Loading />` แสดง "กำลังโหลด..." |
| `ErrorMessage` | `<ErrorMessage message={err.message} />` |
| `EmptyState` | `<EmptyState text="ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย" />` |

ตัวอย่างโครง component ที่เรียก API:

```tsx
const [data, setData] = useState<Data | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

if (loading) return <Loading />;
if (error) return <ErrorMessage message={error} />;
if (!data || data.items.length === 0) return <EmptyState text="ยังไม่มีข้อมูล" />;
```
