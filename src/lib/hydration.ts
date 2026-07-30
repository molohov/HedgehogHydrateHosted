export const BUILTIN_PRESETS = [
  { label: "3 oz", oz: 3 },
  { label: "8 oz", oz: 8 },
  { label: "10 oz", oz: 10 },
  { label: "12 oz", oz: 12 },
] as const;

export type DayTotal = {
  day: string;
  totalOz: number;
  label: string;
};

export type EncouragementMood = "idle" | "happySip" | "goalReached";

export type EncouragementResult = {
  message: string;
  mood: EncouragementMood;
};

const GENERAL_MESSAGES = [
  "Sip sip! You're doing great!",
  "My quills are proud of you!",
  "Hydration high-five!",
  "Another splash closer to your goal!",
  "Tiny sips, big hedgehog energy!",
  "Glug glug — keep it up!",
];

const FIRST_SIP_MESSAGES = [
  "First sip of the day! Let's go!",
  "Day started with a drink — I like your style!",
  "Morning sip unlocked!",
];

const HALFWAY_MESSAGES = [
  "Halfway there! You're blooming!",
  "50% done — my spines are sparkling!",
  "Midway milestone! Keep sipping!",
];

const GOAL_MESSAGES = [
  "Goal reached! Best hedgehog ever!",
  "You did it! Time for a happy hedgehog dance!",
  "Daily goal crushed — I'm doing a little roll!",
];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getLocalDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatEntryTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function totalForDay(
  entries: Array<{ oz: number; loggedAt: Date }>,
  dayKey: string,
  timezone: string,
): number {
  return entries
    .filter((entry) => getLocalDateKey(entry.loggedAt, timezone) === dayKey)
    .reduce((sum, entry) => sum + entry.oz, 0);
}

export function todayTotal(
  entries: Array<{ oz: number; loggedAt: Date }>,
  timezone: string,
): number {
  const todayKey = getLocalDateKey(new Date(), timezone);
  return totalForDay(entries, todayKey, timezone);
}

export function goalProgressPercent(todayOz: number, goalOz: number): number {
  if (goalOz <= 0) {
    return 0;
  }
  return Math.min(Math.round((todayOz / goalOz) * 100), 999);
}

export function rollingSevenDayTotals(
  entries: Array<{ oz: number; loggedAt: Date }>,
  timezone: string,
): DayTotal[] {
  const todayKey = getLocalDateKey(new Date(), timezone);
  const [year, month, day] = todayKey.split("-").map(Number);
  const today = new Date(Date.UTC(year, month - 1, day));

  return Array.from({ length: 7 }, (_, index) => {
    const offset = 6 - index;
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - offset);
    const dayKey = date.toISOString().slice(0, 10);
    const totalOz = totalForDay(entries, dayKey, timezone);

    let label: string;
    if (offset === 0) {
      label = "Today";
    } else if (offset === 1) {
      label = "Yesterday";
    } else {
      label = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }).format(date);
    }

    return { day: dayKey, totalOz, label };
  });
}

export function encouragementForLog(
  beforeTodayOz: number,
  afterTodayOz: number,
  goalOz: number,
): EncouragementResult {
  const mood: EncouragementMood =
    afterTodayOz >= goalOz ? "goalReached" : "happySip";

  let message: string;
  if (beforeTodayOz === 0 && afterTodayOz > 0) {
    message = pickRandom(FIRST_SIP_MESSAGES);
  } else if (
    beforeTodayOz < goalOz / 2 &&
    afterTodayOz >= goalOz / 2 &&
    afterTodayOz < goalOz
  ) {
    message = pickRandom(HALFWAY_MESSAGES);
  } else if (afterTodayOz >= goalOz) {
    message = pickRandom(GOAL_MESSAGES);
  } else {
    message = pickRandom(GENERAL_MESSAGES);
  }

  return { message, mood };
}

export function mascotMoodForProgress(
  todayOz: number,
  goalOz: number,
): EncouragementMood {
  if (todayOz >= goalOz) {
    return "goalReached";
  }
  if (todayOz > 0) {
    return "idle";
  }
  return "idle";
}

export function clampOz(value: number): number {
  return Math.max(1, Math.min(value, 999));
}

export function clampGoal(value: number): number {
  return Math.max(1, Math.min(value, 999));
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
