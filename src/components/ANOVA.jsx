import { useMemo, useState } from 'react'

// Дисперсионный анализ (ANOVA): сравниваем СРАЗУ несколько групп. Идея —
// сопоставить разброс МЕЖДУ группами с разбросом ВНУТРИ групп. Большое
// отношение (F) = группы различаются сильнее, чем шумят внутри.
const W = 560
const H = 240
const PAD = 36
const BASE = H - PAD
const TOP = 20
const GROUPS = 3
const M = 10 // точек в группе

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function ANOVA({ locale = 'ru' }) {
  const en = locale === 'en'
  const [sep, setSep] = useState(8) // разброс между средними групп
  const [within, setWithin] = useState(6) // σ внутри групп
  const noise = useMemo(() => Array.from({ length: GROUPS }, () => Array.from({ length: M }, () => randn())), [])

  const centers = [50 - sep, 50, 50 + sep]
  const groups = noise.map((g, i) => g.map((z) => centers[i] + z * within))
  const means = groups.map((g) => g.reduce((a, b) => a + b, 0) / g.length)
  const grand = means.reduce((a, b) => a + b, 0) / GROUPS
  let ssB = 0, ssW = 0
  means.forEach((mu) => { ssB += M * (mu - grand) ** 2 })
  groups.forEach((g, i) => g.forEach((v) => { ssW += (v - means[i]) ** 2 }))
  const dfB = GROUPS - 1
  const dfW = GROUPS * M - GROUPS
  const msB = ssB / dfB
  const msW = ssW / dfW
  const F = msW ? msB / msW : 0
  const Fcrit = 3.35 // ~ F(2, 27) при α=0.05
  const sig = F > Fcrit

  const sy = (v) => BASE - ((v - 20) / 60) * (BASE - TOP)
  const colX = (i) => PAD + ((i + 0.5) / GROUPS) * (W - 2 * PAD)
  const colors = ['#2ab8eb', '#16a34a', '#a855f7']

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={sy(grand)} x2={W - PAD} y2={sy(grand)} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={W - PAD} y={sy(grand) - 4} fill="#6b7280" fontSize="10" textAnchor="end">{en ? 'grand mean' : 'общее среднее'}</text>
        {groups.map((g, i) => (
          <g key={i}>
            {g.map((v, j) => <circle key={j} cx={colX(i) + (j % 2 ? 6 : -6)} cy={sy(v)} r="3.5" fill={colors[i]} opacity="0.55" />)}
            <line x1={colX(i) - 22} y1={sy(means[i])} x2={colX(i) + 22} y2={sy(means[i])} stroke={colors[i]} strokeWidth="2.5" />
            <text x={colX(i)} y={BASE + 14} fill={colors[i]} fontSize="10" textAnchor="middle">{en ? 'group' : 'группа'} {i + 1}</text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-gray-700">{en ? 'spread BETWEEN groups (SS_b):' : 'разброс МЕЖДУ группами (SS_b):'} {ssB.toFixed(0)}</span>
        <span className="text-gray-700">{en ? 'spread WITHIN (SS_w):' : 'разброс ВНУТРИ (SS_w):'} {ssW.toFixed(0)}</span>
        <span className="text-[#2ab8eb]">F = {F.toFixed(2)}</span>
        <span className={sig ? 'text-green-600' : 'text-gray-600'}>{sig ? (en ? 'F > critical → the groups differ' : 'F > критич. → группы различаются') : (en ? 'F is small → no visible differences' : 'F мал → различий не видно')}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Spread between group means' : 'Разброс между средними групп'}</span><span className="text-cyanink">{sep}</span></div>
          <input type="range" min="0" max="16" step="1" value={sep} onChange={(e) => setSep(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Within-group spread σ' : 'Разброс внутри групп σ'}</span><span className="text-cyanink">{within}</span></div>
          <input type="range" min="2" max="16" step="1" value={within} onChange={(e) => setWithin(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'F = (spread between groups) / (spread within). Pull the means apart — F grows; add noise inside — F drops. That is how ANOVA answers "is there any difference at all" for several groups at once, without breeding pairwise comparisons.'
        : 'F = (разброс между группами) / (разброс внутри). Раздвиньте средние — F растёт; добавьте шум внутри — F падает. Так ANOVA отвечает «есть ли вообще различие» сразу для нескольких групп, не плодя попарных сравнений.'}</p>
    </div>
  )
}
