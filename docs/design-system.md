# Design System

กติกาหน้าตาของ frontend เพื่อให้ทุกหน้าที่เพื่อนแต่ละคนทำดูเป็นแอปเดียวกัน อ้างอิงแนวคิดจาก [pomofocus.io](https://pomofocus.io/) (พื้นหลังเปลี่ยนสีตามโหมด การ์ดโปร่งแสงบนพื้นสี) ค่าที่ระบุเป็นค่าตั้งต้น ถ้าทีมอยากเปลี่ยนให้แก้ที่ไฟล์นี้กับ `src/index.css` (ส่วน `@theme`) ที่เดียว

## 1. สี

### สีประจำโหมด (พื้นหลังทั้งหน้า)

| โหมด | ชื่อ token | Hex | การใช้งาน |
|---|---|---|---|
| Focus | `focus` | `#BA4949` | พื้นหลังตอนโฟกัส |
| Short break | `short` | `#38858A` | พื้นหลังตอนพักสั้น |
| Long break | `long` | `#397097` | พื้นหลังตอนพักยาว |

พื้นหลังเปลี่ยนสีเมื่อสลับโหมด ใช้ `transition-colors duration-500` ให้เปลี่ยนนุ่มๆ

### สีกลาง

| ชื่อ token | Hex | การใช้งาน |
|---|---|---|
| `ink` | `#2D2D2D` | ข้อความหลักบนพื้นสว่าง |
| `muted` | `#6B7280` | ข้อความรอง คำอธิบาย |
| `card` | `#FFFFFF` | พื้นการ์ด (ใช้ `bg-white/10` ถึง `bg-white` ตามความเหมาะสม) |
| `line` | `#E5E7EB` | เส้นแบ่ง ขอบ input |
| `success` | `#16A34A` | สำเร็จ / task ที่ติ๊กแล้ว |
| `danger` | `#DC2626` | ข้อความ error / ปุ่มลบ |

หลักการ: ข้อความบนพื้นสีโหมดใช้ **สีขาว** เสมอ ข้อความบนการ์ดสีขาวใช้ `ink` ห้ามใช้สีโหมดเป็นข้อความบนพื้นสีโหมดเดียวกัน (มองไม่เห็น)

## 2. ตัวอักษร

| ใช้กับ | ฟอนต์ | ขนาด (Tailwind) | น้ำหนัก |
|---|---|---|---|
| ตัวเลขเวลา Timer | Noto Sans Thai (หรือ sans-serif) | `text-8xl` (มือถือ `text-7xl`) | `font-bold` |
| หัวข้อหน้า/ส่วน | Noto Sans Thai | `text-xl` ถึง `text-2xl` | `font-semibold` |
| เนื้อหา / ปุ่ม | Noto Sans Thai | `text-base` | `font-medium` |
| คำอธิบาย / ข้อความรอง | Noto Sans Thai | `text-sm` | `font-normal` |

- ใช้ฟอนต์ที่รองรับภาษาไทยเท่านั้น (Noto Sans Thai จาก Google Fonts)
- ตัวเลข Timer ใส่ `tabular-nums` เพื่อให้ตัวเลขกว้างเท่ากัน หน้าจอไม่สั่นตอนเวลาเปลี่ยน

## 3. ระยะห่างและรูปทรง

| เรื่อง | ค่า |
|---|---|
| ระยะห่างมาตรฐาน | หน่วยละ 4px ใช้ `p-4`, `p-6`, `gap-4` เป็นหลัก ห้ามใช้ค่ากำหนดเอง เช่น `p-[13px]` |
| มุมโค้ง | การ์ด `rounded-xl`, ปุ่ม/ช่องกรอก `rounded-lg` |
| ความกว้างเนื้อหา | `max-w-md` กึ่งกลางหน้า (`mx-auto`) |
| เงา | การ์ดใช้ `shadow-md` เท่านั้น |
| Responsive | ออกแบบมือถือก่อน (กว้าง 360px ขึ้นไป) แล้วค่อยขยายด้วย `md:` |

## 4. Components

### ปุ่ม

| ชนิด | ใช้เมื่อ | คลาสตัวอย่าง |
|---|---|---|
| Primary | การกระทำหลัก (Start, Login) | `bg-white text-focus font-semibold rounded-lg px-8 py-3 shadow-md hover:opacity-90` (สีข้อความตามโหมด) |
| Secondary | การกระทำรอง (Reset, Cancel) | `bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30` |
| Danger | ลบ | `bg-danger text-white rounded-lg px-4 py-2 hover:opacity-90` |
| Disabled | ใช้ไม่ได้ | เพิ่ม `opacity-50 cursor-not-allowed` และใส่ `disabled` จริงที่ element |

ปุ่ม Start/Pause เป็นปุ่มเดียวกัน เปลี่ยนข้อความตาม `status` ของ Timer (`idle`/`paused` = START, `running` = PAUSE)

### การ์ด Timer
กรอบ `bg-white/10 rounded-xl p-6`, แท็บเลือกโหมด 3 ปุ่มอยู่ด้านบน (โหมดที่เลือกอยู่ใช้ `bg-black/15` เพื่อเน้น), ตัวเลขเวลาอยู่กลาง, ปุ่ม Start/Pause และ Reset อยู่ด้านล่าง

### รายการ Task
แต่ละรายการ `bg-white rounded-lg p-4 shadow-md text-ink` มี checkbox ซ้าย ชื่อกลาง ปุ่มลบขวา ถ้า `completed` ให้ขีดฆ่าชื่อ (`line-through`) และใช้สี `muted`

### ฟอร์ม (Login / Register)
- ช่องกรอก `w-full rounded-lg border border-line px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-focus`
- label อยู่เหนือช่องกรอก (`text-sm text-muted`)
- error แสดงใต้ช่องที่ผิด สี `danger` ขนาด `text-sm` ข้อความอ่านเข้าใจ เช่น "รหัสผ่านไม่ถูกต้อง"

### Toast แจ้งเตือน (จาก Notification Service)
- มุมขวาบน `fixed top-4 right-4`, พื้นขาว ข้อความ `ink`, มีไอคอนนำหน้า
- แสดง 5 วินาทีแล้วหายเอง และปิดเองได้ด้วยปุ่ม ×
- เล่นเสียงเตือนพร้อมกัน (ต้องให้ผู้ใช้โต้ตอบกับหน้าเว็บก่อนอย่างน้อย 1 ครั้ง เบราว์เซอร์จึงอนุญาตเล่นเสียง ปุ่ม Start นับเป็นการโต้ตอบแล้ว)

### สรุปประวัติ (History)
การ์ดเล็ก 2 ใบเรียงกัน แสดง "รอบที่เสร็จ" (`pomodoroCount`) และ "เวลาโฟกัสรวม (นาที)" (`totalFocusMin`) ตัวเลขใหญ่ `text-3xl font-bold` ป้ายกำกับ `text-sm muted`

## 5. สถานะที่ต้องออกแบบให้ครบ
ทุกหน้าที่เรียก API ต้องมี 3 สถานะ ไม่ใช่แค่หน้าปกติ:

| สถานะ | การแสดงผล |
|---|---|
| Loading | ข้อความ "กำลังโหลด..." หรือ spinner เล็กๆ ปุ่มที่เกี่ยวข้องเป็น disabled |
| Error | ข้อความสี `danger` บอกสิ่งที่ผิดและทางแก้ (ไม่ใช่แค่ "Error") ใช้ `message` จาก API ได้ |
| Empty | เช่น ยังไม่มี task: "ยังไม่มีงาน เพิ่มงานแรกของคุณได้เลย" |

## 6. Accessibility ขั้นพื้นฐาน
- ปุ่มที่เป็นไอคอนต้องมี `aria-label`
- ใช้ `<button>` กับการกระทำ ไม่ใช้ `<div onClick>`
- ช่องกรอกต้องมี `<label>` ผูกกับ input
- คอนทราสต์ข้อความขาวบนสีโหมดทั้ง 3 สีผ่านเกณฑ์ตัวอักษรขนาดใหญ่ (ตัวเลขเวลาและปุ่ม) แต่ข้อความเล็กบนพื้นสีโหมดควรใช้ตัวหนา (`font-medium`) หรือเพิ่มความทึบพื้นหลังหลังการ์ด

## 7. ตั้งค่า Tailwind (v4)
โปรเจกต์ใช้ Tailwind CSS v4 ซึ่ง **ไม่มีไฟล์ `tailwind.config`** ตั้งค่า token ในไฟล์ CSS ผ่าน `@theme` ใส่ใน `frontend/src/index.css` ให้ทุกคนใช้ชื่อสีเดียวกัน:

```css
@import "tailwindcss";

@theme {
  --color-focus: #BA4949;
  --color-short: #38858A;
  --color-long: #397097;
  --color-ink: #2D2D2D;
  --color-muted: #6B7280;
  --color-line: #E5E7EB;
  --color-success: #16A34A;
  --color-danger: #DC2626;

  --font-sans: "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif;
}
```

ไฟล์นี้ทำอะไร:
- `@import "tailwindcss"`: ดึง Tailwind ทั้งหมดเข้ามา (แทน `@tailwind base/components/utilities` ของ v3)
- `@theme { --color-xxx: ... }`: ประกาศ token ใหม่ Tailwind จะสร้างคลาสให้เองจากชื่อ เช่น `--color-focus` ได้ `bg-focus`, `text-focus`, `border-focus`
- `--font-sans`: ตั้งฟอนต์เริ่มต้นเป็น Noto Sans Thai ถ้าโหลดไม่ได้ให้ใช้ฟอนต์ระบบแทน

โหลดฟอนต์ใน `frontend/index.html` ภายใน `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet" />
```
- `preconnect`: เปิด connection ไปยังเซิร์ฟเวอร์ฟอนต์ล่วงหน้า หน้าโหลดไวขึ้น
- `wght@400;500;600;700`: ขอเฉพาะน้ำหนักที่เราใช้ ไม่โหลดเกิน
- `display=swap`: แสดงข้อความด้วยฟอนต์สำรองก่อน แล้วสลับเมื่อฟอนต์โหลดเสร็จ ไม่ให้หน้าว่าง

### ตัวอย่างการสลับสีพื้นหลังตามโหมด
```tsx
const bg = { focus: "bg-focus", short_break: "bg-short", long_break: "bg-long" }[mode];

return <main className={`${bg} min-h-screen transition-colors duration-500`}>...</main>;
```
Tailwind หาคลาสจากข้อความที่เขียนเต็มในโค้ดเท่านั้น จึงต้องเขียนชื่อคลาสครบเป็น string ตรงๆ แบบนี้ ห้ามประกอบชื่อคลาสด้วยตัวแปร เช่น `` `bg-${mode}` `` เพราะ Tailwind จะมองไม่เห็นและไม่สร้างสีให้

## 8. ข้อห้าม (ให้ทุกคนทำตาม)
- ห้ามใส่สี hex ตรงๆ ในโค้ด ให้ใช้ชื่อ token จากตารางด้านบนเสมอ
- ห้ามสร้างปุ่มหรือการ์ดสไตล์ใหม่ที่ไม่อยู่ในเอกสารนี้ ถ้าต้องการ ให้เพิ่มในไฟล์นี้ผ่าน PR ก่อน
- ห้ามใช้ inline style (`style={{...}}`) ยกเว้นค่าที่คำนวณตอนรัน