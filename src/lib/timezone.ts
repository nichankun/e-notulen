const WITA_OFFSET_MINUTES = 7 * 60;

/**
 * Meeting schedules are entered as local datetime values by the operator.
 * Store those values as an explicit WITA instant so server/browser timezones
 * cannot silently change the meeting time.
 */
export function parseMeetingDateTime(value: string): Date {
  const trimmed = value.trim();

  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) throw new Error("Tanggal tidak valid");
    return date;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    trimmed,
  );
  if (!match) throw new Error("Format tanggal tidak valid");

  const [, year, month, day, hour, minute, second = "0"] = match;
  const localMillis = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const localDate = new Date(localMillis);

  if (
    Number.isNaN(localDate.getTime()) ||
    localDate.getUTCFullYear() !== Number(year) ||
    localDate.getUTCMonth() !== Number(month) - 1 ||
    localDate.getUTCDate() !== Number(day) ||
    localDate.getUTCHours() !== Number(hour) ||
    localDate.getUTCMinutes() !== Number(minute) ||
    localDate.getUTCSeconds() !== Number(second)
  ) {
    throw new Error("Tanggal tidak valid");
  }

  return new Date(localMillis - WITA_OFFSET_MINUTES * 60 * 1000);
}
