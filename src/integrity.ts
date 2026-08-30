import type { JsonObject } from "./contracts.js";

const RFC3339_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;
const RFC3339_TIME = /^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)([Zz]|([+-])(\d{2})(?::?(\d{2}))?)$/u;

/** Match the full RFC 3339 date-time validation used by the published AJV formats. */
export function isRfc3339DateTime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parts = value.split(/[Tt\s]/u);
  if (parts.length !== 2) return false;
  const date = RFC3339_DATE.exec(parts[0]!);
  const time = RFC3339_TIME.exec(parts[1]!);
  if (!date || !time) return false;

  const year = Number(date[1]);
  const month = Number(date[2]);
  const day = Number(date[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const maximumDay = [0, 31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 0;
  if (month < 1 || month > 12 || day < 1 || day > maximumDay) return false;

  const hour = Number(time[1]);
  const minute = Number(time[2]);
  const second = Number(time[3]);
  const offsetSign = time[5] === "-" ? -1 : 1;
  const offsetHour = Number(time[6] ?? 0);
  const offsetMinute = Number(time[7] ?? 0);
  if (offsetHour > 23 || offsetMinute > 59) return false;
  if (hour <= 23 && minute <= 59 && second < 60) return true;

  // RFC 3339 admits 23:59:60 only for a leap second, adjusted for the stated offset.
  const utcMinute = minute - offsetMinute * offsetSign;
  const utcHour = hour - offsetHour * offsetSign - (utcMinute < 0 ? 1 : 0);
  return (utcHour === 23 || utcHour === -1) &&
    (utcMinute === 59 || utcMinute === -1) && second < 61;
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const object = value as JsonObject;
  return `{${Object.keys(object).sort().map((key) =>
    `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(",")}}`;
}

export async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("This browser cannot verify the catalogue checksum.");
  }
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function parseChecksum(value: string, filename: string): string {
  const escaped = filename.replace(".", "\\.");
  const match = value.trim().match(new RegExp(`^([a-f0-9]{64})(?:\\s+\\*?${escaped})?$`, "u"));
  if (!match) throw new Error(`The ${filename} checksum file is invalid.`);
  return match[1]!;
}
