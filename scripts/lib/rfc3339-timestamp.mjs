function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Parse the canonical UTC subset used by release evidence. The explicit
 * component comparison prevents Date.parse normalisation (for example,
 * 30 February) from turning malformed evidence into a valid chronology.
 */
export function parseUtcRfc3339Timestamp(value, label = "Timestamp") {
  const match = typeof value === "string"
    ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/u.exec(value)
    : null;
  const parsed = match ? Date.parse(value) : Number.NaN;
  invariant(match && Number.isFinite(parsed), `${label} must be an RFC 3339 UTC timestamp`);
  const [, year, month, day, hour, minute, second, fraction = ""] = match;
  const observed = new Date(parsed);
  invariant(
    observed.getUTCFullYear() === Number(year)
      && observed.getUTCMonth() + 1 === Number(month)
      && observed.getUTCDate() === Number(day)
      && observed.getUTCHours() === Number(hour)
      && observed.getUTCMinutes() === Number(minute)
      && observed.getUTCSeconds() === Number(second)
      && observed.getUTCMilliseconds() === Number(fraction.padEnd(3, "0") || "0"),
    `${label} has an invalid calendar date or time`,
  );
  return parsed;
}
