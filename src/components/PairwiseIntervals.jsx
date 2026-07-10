import { useState } from 'react'

// Пост-хок после ANOVA: доверительные интервалы попарных разниц средних.
// Тумблер «поправка Тьюки» расширяет интервалы (контроль семейной ошибки).
// Интервал, не накрывающий 0, — значимая разница.
const W = 480
const H = 200
const PAD = 40
const N = 20

export default function PairwiseIntervals({ locale = 'ru' }) {
  const en = locale === 'en'
  const [sep, setSep] = useState(6)
  const [sd, setSd] = useState(7)
  const [tukey, setTukey] = useState(true)

  const means = { A: 50, B: 50 + sep * 0.45, C: 50 + sep }
  const se = (sd / Math.sqrt(N)) * Math.SQRT2
  const mult = tukey ? 2.55 : 1.96 // Тьюки (q/√2 для 3 групп) ≈ шире, чем z
  const pairs = [
    ['A', 'B', means.B - means.A],
    ['A', 'C', means.C - means.A],
    ['B', 'C', means.C - means.B],
  ].map(([g1, g2, d]) => ({ g1, g2, d, lo: d - mult * se, hi: d + mult * se }))

  const dmax = Math.max(...pairs.map((p) => Math.abs(p.hi)), Math.max(...pairs.map((p) => Math.abs(p.lo))), 5) + 2
  const sx = (v) => W / 2 + (v / dmax) * (W / 2 - PAD)
  const rowY = (i) => PAD + i * ((H - 2 * PAD) / 2.0)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={sx(0)} y1={PAD - 14} x2={sx(0)} y2={H - PAD + 14} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(0)} y={PAD - 18} fill="#2a2f3a" fontSize="10" textAnchor="middle">{en ? 'difference = 0' : 'разница = 0'}</text>
        {pairs.map((p, i) => {
          const sig = p.lo > 0 || p.hi < 0
          const c = sig ? '#16a34a' : '#9ca3af'
          const y = rowY(i)
          return (
            <g key={i}>
              <line x1={sx(p.lo)} y1={y} x2={sx(p.hi)} y2={y} stroke={c} strokeWidth="3" />
              <line x1={sx(p.lo)} y1={y - 5} x2={sx(p.lo)} y2={y + 5} stroke={c} strokeWidth="2" />
              <line x1={sx(p.hi)} y1={y - 5} x2={sx(p.hi)} y2={y + 5} stroke={c} strokeWidth="2" />
              <circle cx={sx(p.d)} cy={y} r="3.5" fill={c} />
              <text x={PAD - 30} y={y + 4} fill="#6b7280" fontSize="11">{p.g1}−{p.g2}</text>
              <text x={W - 6} y={y + 4} fill={c} fontSize="10" textAnchor="end">{sig ? (en ? 'significant' : 'значимо') : (en ? 'not sig.' : 'не знач.')}</text>
            </g>
          )
        })}
      </svg>

      <button onClick={() => setTukey((t) => !t)} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">
        {tukey ? (en ? 'Tukey correction: ON (honest)' : 'поправка Тьюки: ВКЛ (честно)') : (en ? 'Tukey correction: OFF (naive)' : 'поправка Тьюки: ВЫКЛ (наивно)')}
      </button>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Spread between groups' : 'Разброс между группами'}</span><span className="text-cyanink">{sep}</span></div>
          <input type="range" min="0" max="14" step="1" value={sep} onChange={(e) => setSep(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Within-group spread σ' : 'Разброс внутри групп σ'}</span><span className="text-cyanink">{sd}</span></div>
          <input type="range" min="3" max="14" step="1" value={sd} onChange={(e) => setSd(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'Each row is a pair’s difference of means with an interval. Missed zero (green) → significant. Switch the Tukey correction off — the intervals narrow and more pairs turn "significant": that is the inflation of false findings under uncorrected pairwise tests.'
        : 'Каждая строка — разница средних пары групп с интервалом. Не накрыл ноль (зелёный) → значимо. Выключите поправку Тьюки — интервалы сузятся, и «значимых» пар станет больше: это и есть раздувание ложных находок при попарных тестах без поправки.'}</p>
    </div>
  )
}
