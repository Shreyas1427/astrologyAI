// Lightweight, offline 'astro' helpers (rule-based + numerology).
// Not precise astronomy; adequate for demo/hackathon needs.

export type BirthInput = {
  name: string
  date: string // ISO date string yyyy-mm-dd
  time: string // HH:mm (24h)
  place: string
  tzOffset: string // e.g. +05:30
}

export type AstroProfile = {
  name: string
  sunSign: string
  element: 'Fire' | 'Earth' | 'Air' | 'Water'
  modality: 'Cardinal' | 'Fixed' | 'Mutable'
  lifePath: number
  chineseAnimal: string
  luckyColor: string
  luckyNumber: number
  summary: string
}

const SIGN_TABLE = [
  ['Capricorn', [12,22], [1,19], 'Earth', 'Cardinal'],
  ['Aquarius',  [1,20],  [2,18], 'Air', 'Fixed'],
  ['Pisces',    [2,19],  [3,20], 'Water', 'Mutable'],
  ['Aries',     [3,21],  [4,19], 'Fire', 'Cardinal'],
  ['Taurus',    [4,20],  [5,20], 'Earth', 'Fixed'],
  ['Gemini',    [5,21],  [6,20], 'Air', 'Mutable'],
  ['Cancer',    [6,21],  [7,22], 'Water', 'Cardinal'],
  ['Leo',       [7,23],  [8,22], 'Fire', 'Fixed'],
  ['Virgo',     [8,23],  [9,22], 'Earth', 'Mutable'],
  ['Libra',     [9,23],  [10,22], 'Air', 'Cardinal'],
  ['Scorpio',   [10,23], [11,21], 'Water', 'Fixed'],
  ['Sagittarius',[11,22],[12,21], 'Fire', 'Mutable'],
] as const

const SIGN_TRAITS: Record<string, string[]> = {
  Aries: ['bold', 'energetic', 'decisive', 'pioneering'],
  Taurus: ['steady', 'sensual', 'practical', 'loyal'],
  Gemini: ['curious', 'adaptable', 'witty', 'communicative'],
  Cancer: ['nurturing', 'intuitive', 'protective', 'empathetic'],
  Leo: ['confident', 'creative', 'warm', 'charismatic'],
  Virgo: ['analytical', 'helpful', 'meticulous', 'grounded'],
  Libra: ['harmonious', 'diplomatic', 'fair', 'aesthetic'],
  Scorpio: ['intense', 'transformational', 'private', 'magnetic'],
  Sagittarius: ['expansive', 'optimistic', 'philosophical', 'adventurous'],
  Capricorn: ['ambitious', 'disciplined', 'resilient', 'strategic'],
  Aquarius: ['visionary', 'inventive', 'independent', 'humanitarian'],
  Pisces: ['dreamy', 'compassionate', 'artistic', 'mystical'],
}

const SIGN_COLORS: Record<string, string> = {
  Aries: '#ef4444',
  Taurus: '#22c55e',
  Gemini: '#06b6d4',
  Cancer: '#14b8a6',
  Leo: '#f59e0b',
  Virgo: '#84cc16',
  Libra: '#a78bfa',
  Scorpio: '#e11d48',
  Sagittarius: '#f97316',
  Capricorn: '#64748b',
  Aquarius: '#38bdf8',
  Pisces: '#60a5fa',
}

const CHINESE_ANIMALS = [
  'Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'
]

function toDateParts(isoDate: string) {
  const [y,m,d] = isoDate.split('-').map(Number)
  return { y, m, d }
}

export function getSunSign(isoDate: string): { sign: string, element: any, modality: any } {
  const {y, m, d} = toDateParts(isoDate)
  for (const [name, start, end, element, modality] of SIGN_TABLE as any) {
    const [sm, sd] = start
    const [em, ed] = end
    const afterStart = (m > sm) || (m === sm && d >= sd)
    const beforeEnd  = (m < em) || (m === em && d <= ed)
    if ((sm <= em && afterStart && beforeEnd) || (sm > em && (afterStart || beforeEnd))) {
      return { sign: name, element, modality }
    }
  }
  return { sign: 'Capricorn', element: 'Earth', modality: 'Cardinal' }
}

export function reduceDigits(n: number): number {
  while (n > 9 && ![11,22,33].includes(n))
    n = n.toString().split('').map(Number).reduce((a,b) => a+b, 0)
  return n
}

export function lifePathFromDate(isoDate: string): number {
  const digits = isoDate.replace(/[^0-9]/g, '').split('').map(Number)
  const sum = digits.reduce((a,b) => a+b, 0)
  return reduceDigits(sum)
}

export function chineseZodiacFromYear(isoDate: string): string {
  const y = Number(isoDate.slice(0,4))
  // Cycle repeats every 12 years; 2008 was a Rat year.
  const idx = (y - 2008) % 12
  const pos = (idx + 12) % 12
  return CHINESE_ANIMALS[pos]
}

export function luckyNumber(lifePath: number): number {
  const table = [3, 6, 9, 2, 1, 8, 7, 5, 4]
  return table[(lifePath - 1) % table.length]
}

export function profileFromBirth(input: BirthInput): AstroProfile {
  const sun = getSunSign(input.date)
  const life = lifePathFromDate(input.date)
  const chinese = chineseZodiacFromYear(input.date)
  const color = (SIGN_COLORS as any)[sun.sign] || '#38bdf8'
  const lucky = luckyNumber(life)
  const traits = SIGN_TRAITS[sun.sign] || []
  const summary = `${input.name}, you're a ${sun.sign} (${sun.element}, ${sun.modality}). Traits: ${traits.slice(0,3).join(', ')}. Life Path ${life}. Chinese Zodiac: ${chinese}.`
  return {
    name: input.name,
    sunSign: sun.sign,
    element: sun.element as any,
    modality: sun.modality as any,
    lifePath: life,
    chineseAnimal: chinese,
    luckyColor: color,
    luckyNumber: lucky,
    summary,
  }
}

// Simple seeded pseudo-random for flavor text
export function seedFrom(str: string): number {
  let h = 2166136261
  for (let i=0; i<str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2**32
}

const DAILY_AFFIRM = [
  "Trust the process; your path unfolds as you act.",
  "Small consistent steps beat rare bursts of effort.",
  "Ask for help; collaboration brings faster clarity.",
  "Rest fuels insight—balance doing with being.",
  "Lead with kindness; it compounds quietly.",
  "Be curious; questions unlock opportunities.",
  "Declutter one thing; make room for growth.",
]

export function dailyMessage(name: string, isoDate: string): string {
  const seed = seedFrom(name + isoDate)
  const idx = Math.floor(seed * DAILY_AFFIRM.length)
  return DAILY_AFFIRM[idx]
}

// Rule-based Q&A fallback if LLM not available
export function qaFallback(question: string, profile: AstroProfile): string {
  const q = question.toLowerCase()
  const key = ['career','job','work','internship','study','exam','love','relationship','marriage','health','money','finance','wealth']
    .find(k => q.includes(k))

  const base = `As a ${profile.sunSign} (${profile.element}), Life Path ${profile.lifePath}: `
  switch (key) {
    case 'career':
    case 'job':
    case 'work':
    case 'internship':
      return base + (
        profile.element === 'Fire' ?
        "act boldly the next 7–10 days; pitch ideas and network. Document wins daily; momentum is your ally." :
        profile.element === 'Earth' ?
        "focus on process—refactor routines, learn one automation, and ship one small improvement this week." :
        profile.element === 'Air' ?
        "ideate and communicate—write a one‑page plan, seek feedback, and iterate fast." :
        "trust intuition—choose fewer, deeper tasks; avoid overcommitting; flow > force."
      )
    case 'study':
    case 'exam':
      return base + (
        profile.modality === 'Mutable' ?
        "use spaced repetition + quick quizzes; rotate subjects to stay engaged." :
        profile.modality === 'Fixed' ?
        "create a strict block schedule; deep work in 50‑min chunks, minimal context switching." :
        "start with an outline and teach-back method; you'll learn fastest by explaining."
      )
    case 'love':
    case 'relationship':
    case 'marriage':
      return base + "name your needs directly this week; schedule one shared ritual. Tiny, reliable gestures beat grand promises."
    case 'health':
      return base + "prioritize sleep consistency and light morning movement; pick one nourishing meal you can repeat."
    case 'money':
    case 'finance':
    case 'wealth':
      return base + "do a 30‑minute review: subscriptions, 1% saving bump, and one low‑risk upskill investment."
    default:
      return base + "clarify intention in one sentence, take the smallest next step today, and review results in 48 hours."
  }
}
