const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type ScheduleSlotLike = {
  day: string;
  startTime: string;
  endTime: string;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((p) => Number.parseInt(p, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

function isSlotActiveOnDay(
  slot: ScheduleSlotLike,
  dayName: string,
  minutesNow: number,
): boolean {
  if (slot.day !== dayName) return false;

  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);

  if (end <= start) {
    return minutesNow >= start;
  }
  return minutesNow >= start && minutesNow < end;
}

/** Overnight portion (e.g. Mon 22:00–01:00 → active Tue until 01:00). */
function isOvernightTailActive(
  slot: ScheduleSlotLike,
  dayName: string,
  minutesNow: number,
): boolean {
  const start = parseTimeToMinutes(slot.startTime);
  const end = parseTimeToMinutes(slot.endTime);
  if (end <= start && slot.day === dayName) {
    return minutesNow < end;
  }
  return false;
}

export function getCurrentScheduleSlot<T extends ScheduleSlotLike>(
  slots: T[],
  now: Date = new Date(),
): T | null {
  const dayName = DAYS[now.getDay()];
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const prevDayName = DAYS[(now.getDay() + 6) % 7];

  for (const slot of slots) {
    if (isSlotActiveOnDay(slot, dayName, minutesNow)) return slot;
  }
  for (const slot of slots) {
    if (isOvernightTailActive(slot, prevDayName, minutesNow)) return slot;
  }
  return null;
}

export function isScheduleSlotLive(
  slot: ScheduleSlotLike,
  slots: ScheduleSlotLike[],
  now: Date = new Date(),
): boolean {
  const current = getCurrentScheduleSlot(slots, now);
  return (
    current?.day === slot.day &&
    current.startTime === slot.startTime &&
    current.endTime === slot.endTime
  );
}
