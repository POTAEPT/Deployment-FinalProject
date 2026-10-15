import { describe, expect, it } from "vitest";
import { formatDate, HistoryStore, isValidDate, isValidFocusMin, sumFocusMin } from "./history";

describe("sumFocusMin", () => {
  // TS-04-04
  it("sums focus minutes", () => {
    expect(sumFocusMin([25, 25, 15])).toBe(65);
  });

  it("returns 0 for an empty list", () => {
    expect(sumFocusMin([])).toBe(0);
  });
});

describe("formatDate", () => {
  // TS-04-05
  it("formats a Date as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-01-01T10:00:00Z"))).toBe("2026-01-01");
  });
});

describe("isValidDate", () => {
  it("accepts a real date in YYYY-MM-DD format", () => {
    expect(isValidDate("2026-01-01")).toBe(true);
  });

  it("rejects wrong formats and dates that do not exist", () => {
    expect(isValidDate("2026-1-1")).toBe(false);
    expect(isValidDate("01/01/2026")).toBe(false);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
  });
});

describe("isValidFocusMin", () => {
  it("accepts a positive number", () => {
    expect(isValidFocusMin(25)).toBe(true);
  });

  it("rejects zero, negative numbers and non-numbers", () => {
    expect(isValidFocusMin(0)).toBe(false);
    expect(isValidFocusMin(-5)).toBe(false);
    expect(isValidFocusMin("25")).toBe(false);
    expect(isValidFocusMin(undefined)).toBe(false);
  });
});

describe("HistoryStore", () => {
  it("summarises the pomodoros recorded on a date", () => {
    const store = new HistoryStore();
    store.add(25, "2026-01-01");
    store.add(25, "2026-01-01");
    store.add(25, "2026-01-02");

    expect(store.getSummary("2026-01-01")).toEqual({
      date: "2026-01-01",
      pomodoroCount: 2,
      totalFocusMin: 50,
    });
  });

  it("returns zeros for a date with no records", () => {
    expect(new HistoryStore().getSummary("2000-01-01")).toEqual({
      date: "2000-01-01",
      pomodoroCount: 0,
      totalFocusMin: 0,
    });
  });
});
