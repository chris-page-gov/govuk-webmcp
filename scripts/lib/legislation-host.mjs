export function isLegislationHostname(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  const hostname = value.toLowerCase().replace(/\.+$/u, "");
  return hostname === "legislation.gov.uk" || hostname.endsWith(".legislation.gov.uk");
}
