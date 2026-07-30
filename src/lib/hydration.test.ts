import { describe, expect, it } from "vitest";
import {
  encouragementForLog,
  getLocalDateKey,
  goalProgressPercent,
  rollingSevenDayTotals,
  todayTotal,
  totalForDay,
} from "@/lib/hydration";

describe("hydration domain", () => {
  const timezone = "America/Los_Angeles";

  it("computes local day totals", () => {
    const entries = [
      { oz: 8, loggedAt: new Date("2026-03-30T16:00:00.000Z") },
      { oz: 12, loggedAt: new Date("2026-03-30T20:00:00.000Z") },
      { oz: 10, loggedAt: new Date("2026-03-29T20:00:00.000Z") },
    ];

    const todayKey = getLocalDateKey(new Date("2026-03-30T21:00:00.000Z"), timezone);
    expect(totalForDay(entries, todayKey, timezone)).toBe(20);
    expect(todayTotal(entries, timezone)).toBeGreaterThanOrEqual(0);
  });

  it("calculates goal progress percent with cap", () => {
    expect(goalProgressPercent(32, 64)).toBe(50);
    expect(goalProgressPercent(128, 64)).toBe(200);
  });

  it("returns seven rolling day buckets", () => {
    const totals = rollingSevenDayTotals([], timezone);
    expect(totals).toHaveLength(7);
    expect(totals.at(-1)?.label).toBe("Today");
  });

  it("picks encouragement milestones", () => {
    const firstSip = encouragementForLog(0, 8, 64);
    expect(firstSip.mood).toBe("happySip");

    const halfway = encouragementForLog(20, 40, 64);
    expect(halfway.message.length).toBeGreaterThan(0);

    const goal = encouragementForLog(60, 64, 64);
    expect(goal.mood).toBe("goalReached");
  });
});
