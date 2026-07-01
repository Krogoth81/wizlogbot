/**
 * Normalizes Norwegian (Bokmål) date/time expressions into English so that
 * chrono-node's English parser can understand them.
 *
 * This is intentionally NOT a full locale — it's a lookup/normalization pass
 * covering the vocabulary people actually use when scheduling something:
 * weekdays, months, relative days, durations ("om 3 dager"), and clock
 * expressions ("klokken seks", "halv seks", "kvart over/på").
 *
 * IMPORTANT: only run this on the *date/time* portion of a message, never on
 * the free-text prediction. Otherwise weekday/relative words inside the
 * prediction get translated and chrono ends up with competing date matches.
 * The command handler enforces this via the `|` delimiter.
 *
 * Verified against chrono-node with { forwardDate: true }.
 */

// Norwegian number words -> integer, covering the 24-hour clock range.
const NUM: Record<string, number> = {
  null: 0, en: 1, én: 1, ett: 1, to: 2, tre: 3, fire: 4, fem: 5, seks: 6,
  sju: 7, syv: 7, åtte: 8, ni: 9, ti: 10, elleve: 11, tolv: 12, tretten: 13,
  fjorten: 14, femten: 15, seksten: 16, sytten: 17, atten: 18, nitten: 19,
  tjue: 20, tjueen: 21, tjueén: 21, tjueett: 21, tjueto: 22, tjuetre: 23, tjuefire: 24,
}

// Longest-first so "tjueto" matches before "to".
const numAlt = Object.keys(NUM).sort((a, b) => b.length - a.length).join('|')
// A clock number is either digits or a Norwegian number word.
const numToken = `(\\d{1,2}|${numAlt})`

const toNum = (t: string): number => (/^\d+$/.test(t) ? Number.parseInt(t, 10) : NUM[t.toLowerCase()])
const hh = (n: number): string => String(((n % 24) + 24) % 24).padStart(2, '0')

// Daytime assumption for bare spoken hours: we assume the intended time falls
// in 06:00–18:00, so hours 0–5 are bumped +12 (00->12, 01->13 … 05->17) and
// 6–12 stay literal. This is why "klokken sju" -> 07:00 and "klokken to" -> 14:00.
// Note the edge: "klokken fem" -> 17:00 but "klokken seks" -> 06:00.
// Shift the threshold here (e.g. `n < 7`) to lean the window later.
const dayify = (n: number): number => (n < 6 ? n + 12 : n)

type Rule = [RegExp, string | ((...args: string[]) => string)]

// Vocabulary replacements. Multi-word phrases must come before their parts.
const WORDS: Rule[] = [
  // relative days
  [/(?<![\p{L}])i\s*overmorgen(?![\p{L}])/giu, 'in 2 days'],
  [/(?<![\p{L}])i\s*morgen(?![\p{L}])/giu, 'tomorrow'],
  [/(?<![\p{L}])i\s*dag(?![\p{L}])/giu, 'today'],
  [/(?<![\p{L}])i\s*forg[åa]rs(?![\p{L}])/giu, '2 days ago'],
  [/(?<![\p{L}])i\s*g[åa]r(?![\p{L}])/giu, 'yesterday'],
  [/(?<![\p{L}])neste(?![\p{L}])/giu, 'next'],
  [/(?<![\p{L}])denne(?![\p{L}])/giu, 'this'],
  [/(?<![\p{L}])forrige(?![\p{L}])/giu, 'last'],
  [/(?<![\p{L}])uke[nr]?(?![\p{L}])/giu, 'week'],
  [/(?<![\p{L}])uka(?![\p{L}])/giu, 'week'],
  [/(?<![\p{L}])midnatt(?![\p{L}])/giu, 'midnight'],
  // weekdays
  [/(?<![\p{L}])mandag(?![\p{L}])/giu, 'monday'],
  [/(?<![\p{L}])tirsdag(?![\p{L}])/giu, 'tuesday'],
  [/(?<![\p{L}])onsdag(?![\p{L}])/giu, 'wednesday'],
  [/(?<![\p{L}])torsdag(?![\p{L}])/giu, 'thursday'],
  [/(?<![\p{L}])fredag(?![\p{L}])/giu, 'friday'],
  [/(?<![\p{L}])lørdag(?![\p{L}])/giu, 'saturday'],
  [/(?<![\p{L}])søndag(?![\p{L}])/giu, 'sunday'],
  // months
  [/(?<![\p{L}])januar(?![\p{L}])/giu, 'january'],
  [/(?<![\p{L}])februar(?![\p{L}])/giu, 'february'],
  [/(?<![\p{L}])mars(?![\p{L}])/giu, 'march'],
  [/(?<![\p{L}])april(?![\p{L}])/giu, 'april'],
  [/(?<![\p{L}])mai(?![\p{L}])/giu, 'may'],
  [/(?<![\p{L}])juni(?![\p{L}])/giu, 'june'],
  [/(?<![\p{L}])juli(?![\p{L}])/giu, 'july'],
  [/(?<![\p{L}])august(?![\p{L}])/giu, 'august'],
  [/(?<![\p{L}])september(?![\p{L}])/giu, 'september'],
  [/(?<![\p{L}])oktober(?![\p{L}])/giu, 'october'],
  [/(?<![\p{L}])november(?![\p{L}])/giu, 'november'],
  [/(?<![\p{L}])desember(?![\p{L}])/giu, 'december'],
  // durations
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+minutt(?:er)?(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} minute${toNum(n) === 1 ? '' : 's'}`],
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+dager?(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} day${toNum(n) === 1 ? '' : 's'}`],
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+uker?(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} week${toNum(n) === 1 ? '' : 's'}`],
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+timer?(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} hour${toNum(n) === 1 ? '' : 's'}`],
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+måneder?(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} month${toNum(n) === 1 ? '' : 's'}`],
  // "år" is invariant in Norwegian (same for singular and plural), so no suffix.
  [new RegExp(`(?<![\\p{L}])om\\s+${numToken}\\s+år(?![\\p{L}])`, 'giu'), (_m, n) => `in ${toNum(n)} year${toNum(n) === 1 ? '' : 's'}`],
  // prepositions / filler
  [/(?<![\p{L}])på(?![\p{L}])/giu, 'on'],
  [/(?<![\p{L}])den(?![\p{L}])/giu, ''],
]

export function normalizeNorwegianDateInput(input: string): string {
  let s = ` ${input} `

  // Norwegian ordinal day marker: "31. desember" -> "31 desember"
  s = s.replace(/(?<=\d)\.(?=\s)/g, '')

  // --- Clock phrases FIRST, before bare number-word substitution ---

  // "halv seks" = 5:30  (Norwegian counts half TOWARD the next hour)
  s = s.replace(new RegExp(`(?<![\\p{L}])halv\\s+${numToken}(?![\\p{L}])`, 'giu'), (_m, n) => `at ${hh(dayify(toNum(n) - 1))}:30`)
  // "kvart over seks" = 6:15
  s = s.replace(new RegExp(`(?<![\\p{L}])kvart\\s+over\\s+${numToken}(?![\\p{L}])`, 'giu'), (_m, n) => `at ${hh(dayify(toNum(n)))}:15`)
  // "kvart på seks" = 5:45
  s = s.replace(new RegExp(`(?<![\\p{L}])kvart\\s+på\\s+${numToken}(?![\\p{L}])`, 'giu'), (_m, n) => `at ${hh(dayify(toNum(n) - 1))}:45`)
  // "klokken/klokka/kl./kl 18:30" (already HH:MM) -> "at 18:30" — explicit time, no daytime bump
  s = s.replace(/(?<![\p{L}])(klokken|klokka|kl\.?)\s+(\d{1,2}:\d{2})(?![\p{L}])/giu, (_m, _k, t) => `at ${t}`)
  // "klokken/klokka/kl./kl seks" (word or bare hour) -> "at 06:00", with the
  // 06:00–18:00 daytime assumption applied via dayify().
  s = s.replace(new RegExp(`(?<![\\p{L}])(klokken|klokka|kl\\.?)\\s+${numToken}(?![\\p{L}])`, 'giu'), (_m, _k, n) => `at ${hh(dayify(toNum(n)))}:00`)

  // Any leftover "klokken/klokka/kl" (e.g. "klokken halv seks", where "halv
  // seks" was already turned into "at 17:30") -> generic "at", then dedupe.
  s = s.replace(/(?<![\p{L}])(klokken|klokka|kl\.?)(?![\p{L}])/giu, 'at')
  s = s.replace(/(?<![\p{L}])at\s+at(?![\p{L}])/giu, 'at')

  // --- Vocabulary ---
  for (const [re, rep] of WORDS) {
    s = s.replace(re, rep as any)
  }

  return s.replace(/\s+/g, ' ').trim()
}
