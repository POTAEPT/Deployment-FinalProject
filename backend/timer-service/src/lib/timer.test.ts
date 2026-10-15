import { describe, expect, it } from "vitest";
import {
  calcEndTime,
  calcTimeLeft,
  createTimerDurations,
  Timer,
  type TimerDurations,
} from "./timer";

describe("timer calculations", () => {
  it("calculates endTime from the current time and seconds remaining", () => {
    expect(calcEndTime(new Date("2026-01-01T10:00:00.000Z"), 1500)).toBe(
      "2026-01-01T10:25:00.000Z",
    );
  });

  it("does not return a negative timeLeft for an elapsed endTime", () => {
    expect(calcTimeLeft("2026-01-01T09:59:00.000Z", new Date("2026-01-01T10:00:00.000Z"))).toBe(
      0,
    );
  });

  it("rounds a partial second up so the timer does not finish early", () => {
    expect(calcTimeLeft("2026-01-01T10:00:01.000Z", new Date("2026-01-01T10:00:00.001Z"))).toBe(
      1,
    );
  });
});

describe("timer state", () => {
  const durations: TimerDurations = { focus: 1500, short_break: 300, long_break: 900 };

  it("starts each mode with its configured duration and server endTime", () => {
    const timer = new Timer(durations, () => new Date("2026-01-01T10:00:00.000Z"));

    expect(timer.start("focus")).toEqual({
      status: "running",
      mode: "focus",
      timeLeft: 1500,
      endTime: "2026-01-01T10:25:00.000Z",
    });
    expect(timer.start("short_break").timeLeft).toBe(300);
  });

  it("preserves remaining time on pause and creates a new endTime on resume", () => {
    let now = new Date("2026-01-01T10:00:00.000Z");
    const timer = new Timer(durations, () => now);
    timer.start("focus");

    now = new Date("2026-01-01T10:05:00.000Z");
    expect(timer.pause()).toEqual({
      status: "paused",
      mode: "focus",
      timeLeft: 1200,
      endTime: null,
    });

    now = new Date("2026-01-01T10:10:00.000Z");
    expect(timer.resume()).toEqual({
      status: "running",
      mode: "focus",
      timeLeft: 1200,
      endTime: "2026-01-01T10:30:00.000Z",
    });
  });

  it("rejects pause and resume when the timer is in the wrong state", () => {
    const timer = new Timer(durations);
    expect(timer.pause()).toBeNull();
    expect(timer.resume()).toBeNull();
  });

  it("resets to the default duration for the active mode", () => {
    const timer = new Timer(durations);
    timer.start("short_break");

    expect(timer.reset()).toEqual({
      status: "idle",
      mode: "short_break",
      timeLeft: 300,
      endTime: null,
    });
  });

  it("reads test durations from environment variables and rejects invalid values", () => {
    expect(createTimerDurations({ FOCUS_SECONDS: "1" }).focus).toBe(1);
    expect(() => createTimerDurations({ FOCUS_SECONDS: "0" })).toThrow(
      "FOCUS_SECONDS must be a positive integer",
    );
  });
});
