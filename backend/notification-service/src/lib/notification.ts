export const DEFAULT_MESSAGES = {
  focus_end: "หมดเวลาโฟกัสแล้ว พักได้เลย",
  break_end: "หมดเวลาพักแล้ว กลับมาโฟกัสกัน",
  timer_end: "หมดเวลา!",
} as const;

export type NotificationType = keyof typeof DEFAULT_MESSAGES;

export type NotificationEvent = {
  type: NotificationType;
  message: string;
  time: string;
};

export function isValidType(value: unknown): value is NotificationType {
  return typeof value === "string" && Object.hasOwn(DEFAULT_MESSAGES, value);
}

export function buildMessage(type: NotificationType, message?: string): string {
  return message ?? DEFAULT_MESSAGES[type];
}
