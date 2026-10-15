import { describe, expect, it } from "vitest";
import { buildMessage, isValidType } from "./notification";

describe("buildMessage", () => {
  it.each([
    ["focus_end", "หมดเวลาโฟกัสแล้ว พักได้เลย"],
    ["break_end", "หมดเวลาพักแล้ว กลับมาโฟกัสกัน"],
    ["timer_end", "หมดเวลา!"],
  ] as const)("returns the default message for %s", (type, expectedMessage) => {
    expect(buildMessage(type)).toBe(expectedMessage);
  });

  it("uses a supplied message instead of the default", () => {
    expect(buildMessage("timer_end", "หมดเวลาแล้วครับ")).toBe("หมดเวลาแล้วครับ");
  });
});

describe("isValidType", () => {
  it.each(["focus_end", "break_end", "timer_end"])("accepts %s", (type) => {
    expect(isValidType(type)).toBe(true);
  });

  it.each(["abc", "", null, 123])("rejects %s", (type) => {
    expect(isValidType(type)).toBe(false);
  });
});
