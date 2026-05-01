function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isOpenNow(schedule?: string, now = new Date()) {
  if (!schedule) return false;

  const normalized = schedule.toLowerCase().trim();
  if (normalized.includes("24 horas") || normalized.includes("24hs")) return true;

  const match = normalized.match(/(\d{1,2}:\d{2})\s*(a|-|hasta)\s*(\d{1,2}:\d{2})/);
  if (!match) return false;

  const opens = toMinutes(match[1]);
  const closes = toMinutes(match[3]);
  const current = now.getHours() * 60 + now.getMinutes();

  if (opens === closes) return true;
  if (opens < closes) return current >= opens && current <= closes;

  return current >= opens || current <= closes;
}
