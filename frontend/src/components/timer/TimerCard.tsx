import type { Mode } from "../../lib/mode";
import { Card } from "../ui";

type TimerCardProps = {
  // เรียกทุกครั้งที่เปลี่ยนโหมด HomePage ใช้เปลี่ยนสีพื้นหลัง
  onModeChange: (mode: Mode) => void;
};

// PLACEHOLDER: IQ ทำต่อใน #26 (แก้ทับไฟล์นี้ได้เลย)
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- placeholder ยังไม่ได้ใช้ onModeChange
export default function TimerCard(_props: TimerCardProps) {
  return <Card variant="glass">TimerCard: กำลังพัฒนา (#26)</Card>;
}
