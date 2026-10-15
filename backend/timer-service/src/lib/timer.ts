export type TimerMode = "focus" | "short_break" | "long_break";
export type TimerStatusName = "idle" | "running" | "paused";

export type TimerDurations = Record<TimerMode, number>;

export type TimerStatus = {
  status: TimerStatusName;
  mode: TimerMode;
  timeLeft: number;
  endTime: string | null;
};

const DEFAULT_DURATIONS: TimerDurations = {
  focus: 1500,
  short_break: 300,
  long_break: 900,
};

const DURATION_ENV_VARS: Record<TimerMode, string> = {
  focus: "FOCUS_SECONDS",
  short_break: "SHORT_BREAK_SECONDS",
  long_break: "LONG_BREAK_SECONDS",
};

export function createTimerDurations(env: NodeJS.ProcessEnv = process.env): TimerDurations {
  return Object.fromEntries(
    (Object.entries(DURATION_ENV_VARS) as [TimerMode, string][]).map(([mode, envName]) => {
      const value = env[envName];
      if (value === undefined || value === "") return [mode, DEFAULT_DURATIONS[mode]];

      const seconds = Number(value);
      if (!Number.isInteger(seconds) || seconds <= 0) {
        throw new Error(`${envName} must be a positive integer`);
      }

      return [mode, seconds];
    }),
  ) as TimerDurations;
}

export function calcEndTime(now: Date, timeLeft: number): string {
  return new Date(now.getTime() + timeLeft * 1000).toISOString();
}

export function calcTimeLeft(endTime: string, now: Date): number {
  return Math.max(0, Math.ceil((Date.parse(endTime) - now.getTime()) / 1000));
}

export class Timer {
  private state: TimerStatus;

  constructor(
    private readonly durations: TimerDurations = DEFAULT_DURATIONS,
    private readonly getNow: () => Date = () => new Date(),
  ) {
    this.state = {
      status: "idle",
      mode: "focus",
      timeLeft: durations.focus,
      endTime: null,
    };
  }

  getStatus(): TimerStatus {
    if (this.state.status !== "running" || this.state.endTime === null) {
      return { ...this.state };
    }

    return {
      ...this.state,
      timeLeft: calcTimeLeft(this.state.endTime, this.getNow()),
    };
  }

  start(mode: TimerMode): TimerStatus {
    const timeLeft = this.durations[mode];
    this.state = {
      status: "running",
      mode,
      timeLeft,
      endTime: calcEndTime(this.getNow(), timeLeft),
    };
    return this.getStatus();
  }

  pause(): TimerStatus | null {
    if (this.state.status !== "running") return null;

    const current = this.getStatus();
    this.state = { ...current, status: "paused", endTime: null };
    return { ...this.state };
  }

  resume(): TimerStatus | null {
    if (this.state.status !== "paused") return null;

    this.state = {
      ...this.state,
      status: "running",
      endTime: calcEndTime(this.getNow(), this.state.timeLeft),
    };
    return this.getStatus();
  }

  reset(): TimerStatus {
    this.state = {
      status: "idle",
      mode: this.state.mode,
      timeLeft: this.durations[this.state.mode],
      endTime: null,
    };
    return { ...this.state };
  }
}
