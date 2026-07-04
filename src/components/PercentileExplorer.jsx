import { useMemo, useState } from 'react'

// Перцентили: ползунок p показывает значение, ниже которого лежит p% данных,
// и заливает соответствующую часть гистограммы. Видно p50/p90/p99 на скошенных данных.
const W = 520
const H = 220
const PAD = 36
const BINS = 28

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

const L = {
  ru: {
    median: 'p50 (медиана)', slider: 'Перцентиль p',
    note: (p, val) => `p${p} = ${val}: ниже этого значения лежит ${p}% данных (закрашено). На скошенных данных хвостовые перцентили (p90, p99) важнее среднего — это «насколько плохо самым невезучим». Так задают SLA: «95% запросов быстрее X».`,
  },
  en: {
    median: 'p50 (median)', slider: 'Percentile p',
    note: (p, val) => `p${p} = ${val}: ${p}% of the data lies below this value (shaded). On skewed data the tail percentiles (p90, p99) matter more than the mean — they say "how bad it gets for the unluckiest". That is how SLAs are set: "95% of requests faster than X".`,
  },
}

export default function PercentileExplorer({ locale = 'ru' }) {
  const l = L[locale] ?? L.ru
  const data = useMemo(() => {
    const r = mulberry32(7)
    return Array.from({ length: 400 }, () => Math.round(Math.exp(3 + 0.9 * (Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()))))).filter((v) => v < 600)
  }, [])
  const sorted = useMemo(() => [...data].sort((a, b) => a - b), [data])
  const [p, setP] = useState(90)

  const pct = (q) => sorted[Math.min(sorted.length - 1, Math.floor((q / 100) * sorted.length))]
  const val = pct(p)
  const dmax = sorted[Math.floor(sorted.length * 0.99)] * 1.05
  const binW = dmax / BINS
  const counts = new Array(BINS).fill(0)
  for (const v of data) { let b = Math.floor(v / binW); if (b >= BINS) b = BINS - 1; counts[b]++ }
  const mc = Math.max(...counts, 1)
  const sx = (x) => PAD + (x / dmax) * (W - 2 * PAD)
  const sy = (c) => H - PAD - (c / mc) * (H - 2 * PAD)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {counts.map((c, k) => {
          const x0 = k * binW
          const filled = x0 + binW <= val
          return c ? <rect key={k} x={sx(x0) + 0.5} y={sy(c)} width={(W - 2 * PAD) / BINS - 1} height={H - PAD - sy(c)} fill={filled ? '#2ab8eb' : '#d6cebf'} opacity={filled ? 0.8 : 0.6} /> : null
        })}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={sx(val)} y1={20} x2={sx(val)} y2={H - PAD} stroke="#fbbf24" strokeWidth="2" />
        <text x={sx(val)} y={16} fill="#d9a300" fontSize="11" textAnchor="middle">p{p} = {val}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-700">
        <span>p25 = {pct(25)}</span>
        <span>{l.median} = {pct(50)}</span>
        <span>p90 = {pct(90)}</span>
        <span>p99 = {pct(99)}</span>
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{l.slider}</span><span className="tabular-nums text-cyanink">{p}</span></div>
        <input type="range" min="1" max="99" step="1" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-accent" />
      </label>
      <p className="text-xs text-gray-500 mt-2">{l.note(p, val)}</p>
    </div>
  )
}
