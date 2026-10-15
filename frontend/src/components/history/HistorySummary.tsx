import { useEffect, useState } from "react";
import { Button, Card, ErrorMessage, Loading } from "../ui";
import { ApiError, apiFetch } from "../../lib/api";
import { HISTORY_URL } from "../../lib/config";

type SummaryResponse = {
  status: string;
  date: string;
  pomodoroCount: number;
  totalFocusMin: number;
};

type HistorySummaryProps = {
  // ไม่บังคับ: ถ้า HomePage เปลี่ยนค่านี้ (เช่น +1 ตอน Timer จบรอบ) จะโหลดสรุปใหม่เอง
  refreshKey?: number;
};

function toMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "โหลดสรุปประวัติไม่ได้ ลองใหม่อีกครั้ง";
}

// การ์ดตัวเลข 1 ใบ: ตัวเลขใหญ่ + ป้ายกำกับ (design-system ข้อ 4 สรุปประวัติ)
function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 text-center">
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-sm text-muted">{label}</span>
    </Card>
  );
}

export default function HistorySummary({ refreshKey = 0 }: HistorySummaryProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // เพิ่มค่าทุกครั้งที่กดปุ่มรีเฟรช เพื่อสั่งให้ useEffect โหลดใหม่
  const [reloadCount, setReloadCount] = useState(0);

  // โหลดสรุปของวันนี้ (ไม่ส่ง date ฝั่ง history-service ใช้วันนี้ให้เอง)
  // ทำงานตอนเปิดหน้า, ตอนกดรีเฟรช และตอน refreshKey เปลี่ยน
  useEffect(() => {
    let ignore = false;

    async function loadSummary() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<SummaryResponse>(`${HISTORY_URL}/api/history/summary`);
        if (!ignore) setSummary(data);
      } catch (err) {
        if (!ignore) setError(toMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      ignore = true;
    };
  }, [refreshKey, reloadCount]);

  return (
    <section className="flex flex-col gap-4" aria-label="สรุปประวัติวันนี้">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">สรุปวันนี้</h2>
        <Button variant="secondary" onClick={() => setReloadCount((n) => n + 1)} disabled={loading}>
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* โหลดครั้งแรกยังไม่มีตัวเลข แสดง Loading; ตอนรีเฟรชให้ตัวเลขเดิมค้างไว้ ไม่กระพริบ */}
      {loading && !summary && <Loading text="กำลังโหลดสรุปประวัติ..." />}

      {/* ค่า 0 คือยังไม่มีรอบที่เสร็จวันนี้ ไม่ใช่ error */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard value={summary.pomodoroCount} label="รอบที่เสร็จ" />
          <StatCard value={summary.totalFocusMin} label="เวลาโฟกัสรวม (นาที)" />
        </div>
      )}
    </section>
  );
}
