import { useState } from 'react'

// Гистограмма (форма данных) + боксплот (ящик с усами) на одной шкале.
// Домен подстраивается под данные: при добавлении выброса ось растягивается,
// и выброс уходит в длинный хвост. Слайдер меняет число корзин.
const W = 640
const H = 240
const PAD = 40
const HIST_TOP = 24
const HIST_BOTTOM = 150
const BOX_Y = 196

function quantile(sorted, p) {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

export default function Histogram({ unit = '', data: initial, bins: initialBins = 9 }) {
  const base = initial ?? [22, 24, 26, 28, 28, 30, 30, 31, 32, 33, 33, 34, 34, 35, 35, 36, 36, 37, 38, 39, 40, 42, 44, 48]
  const [data, setData] = useState(() => [...base])
  const [bins, setBins] = useState(initialBins)
  const u = unit ? ` ${unit}` : ''

  // адаптивный домен с небольшим паддингом
  const dMin = Math.min(...data)
  const dMax = Math.max(...data)
  const pad = Math.max(2, (dMax - dMin) * 0.04)
  const domMin = dMin - pad
  const domMax = dMax + pad
  const sx = (x) => PAD + ((x - domMin) / (domMax - domMin)) * (W - 2 * PAD)

  // гистограмма
  const binW = (domMax - domMin) / bins
  const counts = new Array(bins).fill(0)
  for (const v of data) {
    let k = Math.floor((v - domMin) / binW)
    if (k >= bins) k = bins - 1
    if (k < 0) k = 0
    counts[k]++
  }
  const maxCount = Math.max(...counts, 1)

  // боксплот
  const sorted = [...data].sort((a, b) => a - b)
  const q1 = quantile(sorted, 0.25)
  const med = quantile(sorted, 0.5)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const inside = sorted.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
  const whiskLo = Math.min(...inside)
  const whiskHi = Math.max(...inside)
  const outliers = sorted.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr)

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(domMin + (domMax - domMin) * t))

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {counts.map((c, k) => {
          const h = (c / maxCount) * (HIST_BOTTOM - HIST_TOP)
          const x0 = sx(domMin + k * binW)
          const x1 = sx(domMin + (k + 1) * binW)
          return c > 0 ? (
            <rect key={k} x={x0 + 1} y={HIST_BOTTOM - h} width={Math.max(0, x1 - x0 - 2)} height={h} fill="#2ab8eb" opacity="0.8" rx="1.5" />
          ) : null
        })}
        <line x1={PAD} y1={HIST_BOTTOM} x2={W - PAD} y2={HIST_BOTTOM} stroke="#d6cebf" strokeWidth="1.5" />
        {ticks.map((t, i) => (
          <text key={i} x={sx(t)} y={HIST_BOTTOM + 16} fill="#6b7280" fontSize="10" textAnchor="middle">{t}</text>
        ))}

        <text x={PAD} y={BOX_Y - 18} fill="#6b7280" fontSize="11">ящик с усами</text>
        <line x1={sx(whiskLo)} y1={BOX_Y} x2={sx(whiskHi)} y2={BOX_Y} stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1={sx(whiskLo)} y1={BOX_Y - 6} x2={sx(whiskLo)} y2={BOX_Y + 6} stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1={sx(whiskHi)} y1={BOX_Y - 6} x2={sx(whiskHi)} y2={BOX_Y + 6} stroke="#0ea5e9" strokeWidth="1.5" />
        <rect x={sx(q1)} y={BOX_Y - 12} width={Math.max(0, sx(q3) - sx(q1))} height="24" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" strokeWidth="1.2" />
        <line x1={sx(med)} y1={BOX_Y - 12} x2={sx(med)} y2={BOX_Y + 12} stroke="#2ab8eb" strokeWidth="2" />
        {outliers.map((o, i) => (
          <circle key={i} cx={sx(o)} cy={BOX_Y} r="4" fill="#fbbf24" />
        ))}
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-700">
        <span><span className="text-[#2ab8eb]">Медиана:</span> {med.toFixed(0)}{u}</span>
        <span><span className="text-[#0ea5e9]">Q1–Q3:</span> {q1.toFixed(0)}–{q3.toFixed(0)}{u}</span>
        <span><span className="text-[#fbbf24]">Выбросы:</span> {outliers.length ? outliers.map((o) => o + u).join(', ') : '—'}</span>
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1">
          <span>Число корзин</span>
          <span className="tabular-nums text-cyanink">{bins}</span>
        </div>
        <input type="range" min="3" max="14" step="1" value={bins} onChange={(e) => setBins(Number(e.target.value))} className="w-full accent-accent" />
      </label>

      <div className="flex gap-2 mt-3">
        <button onClick={() => setData((d) => [...d, 90])} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">+ добавить директора</button>
        <button onClick={() => setData([...base])} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">сбросить</button>
      </div>
    </div>
  )
}
