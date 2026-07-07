import { useMemo, useState } from 'react'

// Перцентили на конкретной метрике (время доставки, мин). Ползунок p заливает
// долю p% гистограммы и рисует линию перцентиля. По битам подсвечиваются:
// iqr — коробка Q1–Q3; mean — сравнение медианы и среднего; rank — рэнк-строка
// (все наблюдения по местам). Данные скошены вправо — виден разрыв median/mean.
const W = 520
const H = 250
const PAD = 40
const BINS = 26
const BASE = H - PAD

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function randn(r) { return Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()) }

const L = {
  ru: { slider: 'Перцентиль p', reset: 'сбросить', mean: 'среднее', median: 'медиана', rank: 'ранг',
    axis: (m, u) => `${m}${u ? `, ${u}` : ''}`,
    rankNote: (p, k, n) => `Ранг: значение p${p} стоит выше ≈ ${p}% наблюдений — примерно ${k}-е из ${n} в упорядоченном ряду. Перцентиль = ранг в процентах.`,
    note: (p, val, u) => `p${p} = ${val}${u}: ниже этого значения лежит ${p}% данных (закрашено). На скошенных данных хвостовые перцентили (p90, p99) важнее среднего — это «насколько плохо самым невезучим». Так задают SLA: «95% запросов быстрее X».`,
  },
  en: { slider: 'Percentile p', reset: 'reset', mean: 'mean', median: 'median', rank: 'rank',
    axis: (m, u) => `${m}${u ? `, ${u}` : ''}`,
    rankNote: (p, k, n) => `Rank: the value p${p} sits above ≈ ${p}% of observations — about ${k}th of ${n} in the ordered row. A percentile is a rank in percent.`,
    note: (p, val, u) => `p${p} = ${val}${u}: ${p}% of the data lies below this value (shaded). On skewed data the tail percentiles (p90, p99) matter more than the mean — they say "how bad it gets for the unluckiest". That is how SLAs are set: "95% of requests faster than X".`,
  },
}

export default function PercentileExplorer({ locale = 'ru', highlight, unit = '', metric = '' }) {
  const l = L[locale] ?? L.ru
  const u = unit ? ` ${unit}` : ''
  const data = useMemo(() => {
    const r = mulberry32(7)
    return Array.from({ length: 130 }, () => Math.max(6, Math.round(Math.exp(3.09 + 0.45 * randn(r)))))
  }, [])
  const sorted = useMemo(() => [...data].sort((a, b) => a - b), [data])
  const N = sorted.length
  const [p, setP] = useState(90)

  const pct = (q) => sorted[Math.min(N - 1, Math.floor((q / 100) * N))]
  const val = pct(p)
  const mean = data.reduce((a, b) => a + b, 0) / N
  const q1 = pct(25), med = pct(50), q3 = pct(75), iqr = q3 - q1

  const dmax = pct(99) * 1.08
  const binW = dmax / BINS
  const counts = new Array(BINS).fill(0)
  for (const v of data) { let b = Math.floor(v / binW); if (b >= BINS) b = BINS - 1; counts[b]++ }
  const mc = Math.max(...counts, 1)
  const sx = (x) => PAD + (Math.min(x, dmax) / dmax) * (W - 2 * PAD)
  const sy = (c) => BASE - (c / mc) * (BASE - 34)

  const showIqr = highlight === 'iqr'
  const showMean = highlight === 'mean'
  const showRank = highlight === 'rank'
  const rankK = Math.max(1, Math.round((p / 100) * N))

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* коробка Q1–Q3 (IQR) */}
        {showIqr && (
          <>
            <rect x={sx(q1)} y={30} width={Math.max(1, sx(q3) - sx(q1))} height={BASE - 30} fill="#0ea5e9" opacity="0.12" />
            <line x1={sx(q1)} y1={30} x2={sx(q1)} y2={BASE} stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={sx(q3)} y1={30} x2={sx(q3)} y2={BASE} stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={sx(q1)} y1={26} x2={sx(q3)} y2={26} stroke="#0d7fb0" strokeWidth="1.2" />
            <text x={(sx(q1) + sx(q3)) / 2} y={22} fill="#0d7fb0" fontSize="10" textAnchor="middle">IQR = {iqr}{u}</text>
            <text x={sx(q1)} y={BASE + 26} fill="#0d7fb0" fontSize="9" textAnchor="middle">Q1 {q1}</text>
            <text x={sx(q3)} y={BASE + 26} fill="#0d7fb0" fontSize="9" textAnchor="middle">Q3 {q3}</text>
          </>
        )}

        {/* гистограмма: слева от перцентиля закрашена */}
        {counts.map((c, k) => {
          const x0 = k * binW
          const filled = x0 + binW <= val
          return c ? <rect key={k} x={sx(x0) + 0.5} y={sy(c)} width={(W - 2 * PAD) / BINS - 1} height={BASE - sy(c)} fill={filled ? '#2ab8eb' : '#d6cebf'} opacity={filled ? 0.8 : 0.55} /> : null
        })}
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />

        {/* рэнк-строка: все наблюдения по местам под осью */}
        {sorted.map((v, i) => (
          <line key={i} x1={sx(v)} y1={BASE + 2} x2={sx(v)} y2={BASE + 9}
            stroke={showRank ? (v <= val ? '#2ab8eb' : '#c9c1b2') : '#c9c1b2'} strokeWidth="1" opacity={showRank ? 0.9 : 0.5} />
        ))}

        {/* среднее vs медиана */}
        {showMean && <>
          <line x1={sx(med)} y1={30} x2={sx(med)} y2={BASE} stroke="#7c3aed" strokeWidth="2" />
          <text x={sx(med)} y={BASE + 26} fill="#7c3aed" fontSize="9" textAnchor="middle">{l.median} {med}</text>
          <line x1={sx(mean)} y1={30} x2={sx(mean)} y2={BASE} stroke="#16a34a" strokeWidth="2" />
          <text x={sx(mean)} y={BASE + 38} fill="#16a34a" fontSize="9" textAnchor="middle">{l.mean} {mean.toFixed(0)}</text>
        </>}

        {/* линия текущего перцентиля */}
        <line x1={sx(val)} y1={20} x2={sx(val)} y2={BASE} stroke="#fbbf24" strokeWidth="2" />
        <text x={sx(val)} y={16} fill="#d9a300" fontSize="11" textAnchor="middle">p{p} = {val}{u}</text>

        <text x={W / 2} y={H - 4} fill="#9a907c" fontSize="10" textAnchor="middle">{l.axis(metric, unit)}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-700">
        <span>p25 = {q1}{u}</span>
        <span>p50 = {med}{u}</span>
        <span>p90 = {pct(90)}{u}</span>
        <span>p99 = {pct(99)}{u}</span>
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{l.slider}</span><span className="tabular-nums text-cyanink">{p}</span></div>
        <input type="range" min="1" max="99" step="1" value={p} onChange={(e) => setP(Number(e.target.value))} className="w-full accent-accent" />
      </label>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500 pr-3">{showRank ? l.rankNote(p, rankK, N) : l.note(p, val, u)}</p>
        <button onClick={() => setP(90)} className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{l.reset}</button>
      </div>
    </div>
  )
}
