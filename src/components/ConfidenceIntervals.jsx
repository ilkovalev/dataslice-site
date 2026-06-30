import { useState } from 'react'

// Доверительные интервалы: каждая выборка даёт свой интервал; доля интервалов,
// накрывающих истину, ≈ уровню доверия. Цвета поясняются легендой, ведётся счёт
// «накрыли / не накрыли», показана формула CI (в т.ч. для доли в A/B).
const W = 560
const H = 250
const PAD = 24
const TRUE = 50
const SE = 8
const VISIBLE = 20
const Z = { 90: 1.645, 95: 1.96, 99: 2.576 }

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function ConfidenceIntervals() {
  const [items, setItems] = useState([]) // {lo,hi,covers}
  const [level, setLevel] = useState(95)
  const z = Z[level]
  const sx = (x) => PAD + (x / 100) * (W - 2 * PAD)

  function draw(k) {
    const add = []
    for (let i = 0; i < k; i++) {
      const mean = TRUE + randn() * SE
      const lo = mean - z * SE
      const hi = mean + z * SE
      add.push({ lo, hi, covers: lo <= TRUE && hi >= TRUE })
    }
    setItems((p) => [...p, ...add])
  }
  function reset() { setItems([]) }
  function changeLevel(l) { setLevel(l); setItems([]) }

  const shown = items.slice(-VISIBLE)
  const covered = items.filter((it) => it.covers).length
  const missed = items.length - covered
  const rowH = (H - 2 * PAD) / VISIBLE

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={sx(TRUE)} y1={PAD - 6} x2={sx(TRUE)} y2={H - PAD} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(TRUE)} y={PAD - 10} fill="#2a2f3a" fontSize="10" textAnchor="middle">истинное значение</text>
        {shown.map((it, i) => {
          const y = PAD + i * rowH + rowH / 2
          const c = it.covers ? '#2ab8eb' : '#f87171'
          return (
            <g key={i}>
              <line x1={sx(it.lo)} y1={y} x2={sx(it.hi)} y2={y} stroke={c} strokeWidth="2.5" opacity="0.85" />
              <circle cx={sx((it.lo + it.hi) / 2)} cy={y} r="2.5" fill={c} />
            </g>
          )
        })}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#2ab8eb]">▬ синий — интервал накрыл истину: {covered}</span>
        <span className="text-[#f87171]">▬ красный — НЕ накрыл: {missed}</span>
        <span className="text-gray-700">накрыли {items.length ? ((covered / items.length) * 100).toFixed(0) : '—'}% <span className="text-gray-500">(ожидается ≈ {level}%)</span></span>
      </div>

      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-3 py-2 text-sm">
        <div className="font-mono text-gray-800">CI = x̄ ± z·SE = x̄ ± {z}·(σ/√n)</div>
        <div className="font-mono text-gray-700 mt-1">для доли (A/B): p̂ ± {z}·√( p̂(1−p̂)/n )</div>
        <div className="text-xs text-gray-500 mt-1">z зависит от уровня доверия: 90% → 1.645, 95% → 1.96, 99% → 2.576. Выше уровень — шире интервал.</div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-gray-500">Уровень:</span>
        {[90, 95, 99].map((l) => (
          <button key={l} onClick={() => changeLevel(l)} className={`text-xs px-2 py-1 rounded border ${level === l ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{l}%</button>
        ))}
        <span className="w-2" />
        <button onClick={() => draw(1)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">взять выборку</button>
        <button onClick={() => draw(20)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">взять 20</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-600 hover:bg-black/5">сбросить</button>
      </div>
    </div>
  )
}
