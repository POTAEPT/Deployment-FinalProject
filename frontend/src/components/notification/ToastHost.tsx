import { useCallback, useEffect, useRef, useState } from "react";
import { NOTIFY_URL } from "../../lib/config";

const TOAST_DURATION_MS = 5_000;

type NotificationType = "focus_end" | "break_end" | "timer_end";

type NotificationEvent = {
  type: NotificationType;
  message: string;
  time: string;
};

type Toast = NotificationEvent & { id: number };

const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  focus_end: "🎯",
  break_end: "☕",
  timer_end: "⏱️",
};

function isNotificationEvent(value: unknown): value is NotificationEvent {
  if (typeof value !== "object" || value === null) return false;

  const event = value as Record<string, unknown>;
  const isKnownType =
    event.type === "focus_end" || event.type === "break_end" || event.type === "timer_end";

  return isKnownType && typeof event.message === "string" && typeof event.time === "string";
}

function playAlarm(context: AudioContext | null) {
  // เสียงเล่นได้เมื่อผู้ใช้โต้ตอบกับหน้าเว็บและ browser ปลดล็อก AudioContext แล้ว
  if (!context || context.state !== "running") return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, now);
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.35);
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timeoutIds = useRef(new Map<number, number>());

  const removeToast = useCallback((id: number) => {
    const timeoutId = timeoutIds.current.get(id);
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    timeoutIds.current.delete(id);
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${NOTIFY_URL}/api/notify/stream`);
    const effectTimeoutIds = timeoutIds.current;
    let audioContext: AudioContext | null = null;

    // Start และการโต้ตอบอื่น ๆ ด้วยเมาส์หรือคีย์บอร์ดจะปลดล็อกเสียงสำหรับ event ถัดไป
    const unlockAudio = () => {
      if (typeof window.AudioContext === "undefined") return;

      audioContext ??= new window.AudioContext();
      if (audioContext.state === "suspended") {
        void audioContext.resume().catch(() => undefined);
      }
    };

    const onMessage = (messageEvent: MessageEvent<string>) => {
      try {
        const event: unknown = JSON.parse(messageEvent.data);
        if (!isNotificationEvent(event)) return;

        const id = nextId.current + 1;
        nextId.current = id;
        setToasts((currentToasts) => [...currentToasts, { ...event, id }]);
        playAlarm(audioContext);

        const timeoutId = window.setTimeout(() => removeToast(id), TOAST_DURATION_MS);
        timeoutIds.current.set(id, timeoutId);
      } catch {
        // ข้อมูล event ที่อ่านไม่ได้จะถูกละไว้ โดยไม่กระทบหน้าเว็บ
      }
    };

    eventSource.addEventListener("message", onMessage as EventListener);
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      eventSource.removeEventListener("message", onMessage as EventListener);
      eventSource.close();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      effectTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      effectTimeoutIds.clear();
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, [removeToast]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-3 md:left-auto md:w-full md:max-w-md"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex w-full items-start gap-3 rounded-xl bg-white p-4 text-ink shadow-md"
        >
          <span aria-hidden="true" className="text-xl">
            {NOTIFICATION_ICONS[toast.type]}
          </span>
          <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            aria-label={`ปิดการแจ้งเตือน: ${toast.message}`}
            onClick={() => removeToast(toast.id)}
            className="rounded-lg p-1 text-ink hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
