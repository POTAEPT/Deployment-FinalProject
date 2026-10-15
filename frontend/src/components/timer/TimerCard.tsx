import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "../../lib/api";
import { TIMER_URL } from "../../lib/config";
import { MODE_LABEL, type Mode } from "../../lib/mode";
import { Button, Card, ErrorMessage, Loading } from "../ui";

type TimerStatus = "idle" | "running" | "paused";

type TimerResponse = {
  status: TimerStatus;
  mode: Mode;
  timeLeft: number;
  endTime: string | null;
};

type TimerCardProps = {
  onModeChange: (mode: Mode) => void;
  onFocusComplete: () => void;
};

const MODE_SECONDS: Record<Mode, number> = {
  focus: 1500,
  short_break: 300,
  long_break: 900,
};

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "เกิดข้อผิดพลาดขณะติดต่อ Timer ลองใหม่อีกครั้ง";
}

function getTimeLeft(endTime: string, now: number): number {
  return Math.max(0, Math.ceil((Date.parse(endTime) - now) / 1000));
}

function fetchTimerStatus(): Promise<TimerResponse> {
  return apiFetch<TimerResponse>(`${TIMER_URL}/api/timer/status`);
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function TimerCard({ onModeChange, onFocusComplete }: TimerCardProps) {
  const [timer, setTimer] = useState<TimerResponse | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>("focus");
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completedEndTime = useRef<string | null>(null);

  const applyStatus = useCallback(
    (status: TimerResponse) => {
      setTimer(status);
      setSelectedMode(status.mode);
      onModeChange(status.mode);
      setNow(Date.now());
    },
    [onModeChange],
  );

  useEffect(() => {
    let ignore = false;

    fetchTimerStatus()
      .then((status) => {
        if (!ignore) applyStatus(status);
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [applyStatus]);

  useEffect(() => {
    if (timer?.status !== "running" || !timer.endTime) return;

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [timer?.status, timer?.endTime]);

  const timeLeft =
    timer?.status === "running" && timer.endTime
      ? getTimeLeft(timer.endTime, now)
      : (timer?.timeLeft ?? MODE_SECONDS[selectedMode]);

  useEffect(() => {
    if (
      timer?.status !== "running" ||
      !timer.endTime ||
      timeLeft > 0 ||
      completedEndTime.current === timer.endTime
    ) {
      return;
    }

    completedEndTime.current = timer.endTime;
    setTimer((current) =>
      current?.endTime === timer.endTime
        ? { ...current, status: "idle", timeLeft: 0, endTime: null }
        : current,
    );
    if (timer.mode === "focus") onFocusComplete();
  }, [timer, timeLeft, onFocusComplete]);

  async function sendAction(path: string, body?: { mode: Mode }) {
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetch<TimerResponse>(`${TIMER_URL}/api/timer/${path}`, {
        method: "POST",
        body,
      });
      if (path === "reset") {
        setTimer({
          ...result,
          mode: selectedMode,
          timeLeft:
            result.mode === selectedMode ? result.timeLeft : MODE_SECONDS[selectedMode],
          endTime: null,
        });
      } else {
        setTimer(result);
        setSelectedMode(result.mode);
        onModeChange(result.mode);
      }
      setNow(Date.now());
      completedEndTime.current = null;
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setSaving(false);
    }
  }

  function selectMode(mode: Mode) {
    if (timer?.status !== "idle" || mode === selectedMode) return;

    setSelectedMode(mode);
    setTimer((current) =>
      current ? { ...current, mode, timeLeft: MODE_SECONDS[mode], endTime: null } : current,
    );
    onModeChange(mode);
  }

  function retryStatus() {
    setLoading(true);
    setError(null);
    void fetchTimerStatus()
      .then(applyStatus)
      .catch((loadError: unknown) => setError(getErrorMessage(loadError)))
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <Card variant="glass">
        <Loading text="กำลังโหลดสถานะ Timer..." />
      </Card>
    );
  }

  if (!timer) {
    return (
      <Card variant="glass" className="flex flex-col gap-4">
        <ErrorMessage message={error ?? "โหลดสถานะ Timer ไม่สำเร็จ"} />
        <Button variant="primary" mode={selectedMode} onClick={retryStatus}>
          ลองใหม่
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="flex flex-col items-center gap-8">
      <div className="grid w-full grid-cols-3 rounded-lg bg-white/10 p-1">
        {(Object.keys(MODE_LABEL) as Mode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={selectedMode === mode}
            disabled={saving || timer.status !== "idle"}
            onClick={() => selectMode(mode)}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
              selectedMode === mode ? "bg-black/15" : "hover:bg-white/10"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {MODE_LABEL[mode]}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-5">
        <p
          role="timer"
          aria-label={`เหลือเวลา ${formatTime(timeLeft)}`}
          className="text-7xl font-bold tabular-nums sm:text-8xl"
        >
          {formatTime(timeLeft)}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            mode={selectedMode}
            disabled={saving}
            onClick={() => {
              if (timer.status === "running") void sendAction("pause");
              else if (timer.status === "paused") void sendAction("resume");
              else void sendAction("start", { mode: selectedMode });
            }}
          >
            {timer.status === "running" ? "PAUSE" : "START"}
          </Button>
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => void sendAction("reset")}
          >
            Reset
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loading text="กำลังอัปเดต Timer..." />}
    </Card>
  );
}
