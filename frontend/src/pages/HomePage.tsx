import { useState } from "react";
import HistorySummary from "../components/history/HistorySummary";
import ToastHost from "../components/notification/ToastHost";
import TaskList from "../components/task/TaskList";
import TimerCard from "../components/timer/TimerCard";
import { Button } from "../components/ui";
import { useAuth } from "../lib/auth";
import { MODE_BG, type Mode } from "../lib/mode";

// หน้าหลักหลัง login: วาง component ของทุกคนไว้ในหน้าเดียว
export default function HomePage() {
  const { username, logout } = useAuth();
  // TimerCard บอกโหมดผ่าน onModeChange แล้วพื้นหลังทั้งหน้าเปลี่ยนสีตาม
  const [mode, setMode] = useState<Mode>("focus");

  return (
    <main className={`${MODE_BG[mode]} min-h-screen text-white transition-colors duration-500`}>
      <ToastHost />
      <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Pomodoro</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{username}</span>
            <Button variant="secondary" onClick={logout}>
              ออกจากระบบ
            </Button>
          </div>
        </header>
        <TimerCard onModeChange={setMode} />
        <HistorySummary />
        <TaskList />
      </div>
    </main>
  );
}
