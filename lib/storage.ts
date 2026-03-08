export const KEY_PREFIX = 'nw_'

export function getDay(dateStr: string): string[] {
  try { return JSON.parse(localStorage.getItem(KEY_PREFIX + dateStr) || '[]') || [] }
  catch { return [] }
}

export function saveDay(dateStr: string, times: string[]) {
  times.sort()
  localStorage.setItem(KEY_PREFIX + dateStr, JSON.stringify(times))
}
