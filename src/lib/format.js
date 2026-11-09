export function fmtDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function fmtDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function dayMonth(value) {
  if (!value) {
    const fallback = { day: "—", month: "" };
    fallback.toString = () => "—";
    fallback.split = (delim) => "—".split(delim);
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const fallback = { day: "—", month: "" };
    fallback.toString = () => "—";
    fallback.split = (delim) => "—".split(delim);
    return fallback;
  }
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" });
  const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase();
  const res = { day, month };
  res.toString = () => `${day} ${month}`;
  res.split = (delim) => `${day} ${month}`.split(delim);
  return res;
}

export function paragraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}