const STORAGE_KEY = 'ssl_progress'

interface DayProgress {
  completedAt: string
  journal?: { q1: string; q2: string; q3: string }
}

interface Progress {
  [day: number]: DayProgress
}

function load(): Progress {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function save(data: Progress) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function isDayCompleted(day: number): boolean {
  return !!load()[day]
}

export function completeDay(day: number, journal: { q1: string; q2: string; q3: string }) {
  const data = load()
  data[day] = { completedAt: new Date().toISOString(), journal }
  save(data)
}

export function getStreak(todayDay: number): number {
  const data = load()
  let streak = 0
  for (let d = todayDay; d >= 1; d--) {
    if (data[d]) streak++
    else break
  }
  return streak
}

export function getTotalCompleted(): number {
  return Object.keys(load()).length
}

export function getDayProgress(day: number): DayProgress | null {
  return load()[day] || null
}
