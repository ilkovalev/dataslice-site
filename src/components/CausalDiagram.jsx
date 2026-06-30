import { useState } from 'react'

// Причинные структуры из трёх узлов: конфаундер, коллайдер, медиатор.
// Тумблер «контролировать Z» показывает, когда контроль помогает, а когда —
// создаёт ложную связь или убивает реальную. Контролировать «всё подряд» нельзя.
const W = 460
const H = 200
const NODES = { X: [90, 150], Y: [370, 150], Z: [230, 50] }

const STRUCT = {
  confounder: {
    label: 'Конфаундер (Z → X, Z → Y)',
    edges: [['Z', 'X'], ['Z', 'Y']],
    no: { assoc: 'есть', kind: 'ложная (создана Z)', good: false },
    yes: { assoc: 'нет', kind: 'очищена — верно', good: true },
    verdict: { no: 'Без контроля видна ложная связь X–Y.', yes: 'Контроль Z убирает ложную связь — ЭТО ПРАВИЛЬНО.' },
  },
  collider: {
    label: 'Коллайдер (X → Z, Y → Z)',
    edges: [['X', 'Z'], ['Y', 'Z']],
    no: { assoc: 'нет', kind: 'X и Y независимы — верно', good: true },
    yes: { assoc: 'есть', kind: 'ложная (создана контролем!)', good: false },
    verdict: { no: 'Без контроля X и Y не связаны — так и есть.', yes: 'Контроль коллайдера СОЗДАЁТ ложную связь — ЭТО ОШИБКА.' },
  },
  mediator: {
    label: 'Медиатор / цепочка (X → Z → Y)',
    edges: [['X', 'Z'], ['Z', 'Y']],
    no: { assoc: 'есть', kind: 'истинный эффект X на Y', good: true },
    yes: { assoc: 'нет', kind: 'реальный путь заблокирован', good: false },
    verdict: { no: 'Без контроля видно реальное влияние X на Y (через Z).', yes: 'Контроль медиатора УБИВАЕТ реальный эффект — обычно не нужно.' },
  },
}

export default function CausalDiagram() {
  const [s, setS] = useState('confounder')
  const [ctrl, setCtrl] = useState(false)
  const st = STRUCT[s]
  const cur = ctrl ? st.yes : st.no
  const arrow = ([a, b]) => {
    const [x1, y1] = NODES[a]; const [x2, y2] = NODES[b]
    const ang = Math.atan2(y2 - y1, x2 - x1)
    const r = 24
    const sx = x1 + Math.cos(ang) * r, sy = y1 + Math.sin(ang) * r
    const ex = x2 - Math.cos(ang) * r, ey = y2 - Math.sin(ang) * r
    return { sx, sy, ex, ey }
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(STRUCT).map(([k, v]) => (
          <button key={k} onClick={() => setS(k)} className={`text-xs px-2.5 py-1 rounded border ${s === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{v.label.split(' (')[0]}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        <defs>
          <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#6b7280" /></marker>
        </defs>
        {st.edges.map((e, i) => { const a = arrow(e); return <line key={i} x1={a.sx} y1={a.sy} x2={a.ex} y2={a.ey} stroke="#6b7280" strokeWidth="2" markerEnd="url(#ah)" /> })}
        {Object.entries(NODES).map(([name, [x, y]]) => {
          const isZ = name === 'Z'
          return (
            <g key={name}>
              <circle cx={x} cy={y} r="22" fill={isZ && ctrl ? '#fbbf24' : '#e7e1d4'} stroke={isZ && ctrl ? '#d9a300' : '#c9bfa9'} strokeWidth={isZ && ctrl ? 2.5 : 1.5} />
              <text x={x} y={y + 5} fontSize="15" textAnchor="middle" fill="#2a2f3a" fontWeight="600">{name}</text>
            </g>
          )
        })}
        {ctrl && <text x={NODES.Z[0]} y={NODES.Z[1] - 30} fontSize="10" textAnchor="middle" fill="#d9a300">контролируем</text>}
      </svg>

      <div className="mt-2 text-sm">
        <div className="text-gray-700">Наблюдаемая связь X–Y: <span className={cur.good ? 'text-green-600 font-medium' : 'text-[#dc4d4d] font-medium'}>{cur.assoc}</span> — {cur.kind}</div>
        <div className={`mt-1 rounded-lg border px-3 py-2 ${cur.good ? 'border-green-500/30 bg-green-500/5 text-gray-700' : 'border-amber-400/40 bg-amber-400/[0.07] text-gray-700'}`}>
          {ctrl ? st.verdict.yes : st.verdict.no}
        </div>
      </div>

      <button onClick={() => setCtrl((c) => !c)} className="mt-3 text-xs px-2.5 py-1 rounded border border-accent/40 text-cyanink hover:bg-accent/10">
        {ctrl ? 'не контролировать Z' : 'контролировать Z'}
      </button>
      <p className="text-xs text-gray-500 mt-2">Один и тот же приём (контроль Z) в разных структурах даёт противоположный результат: для конфаундера — спасает, для коллайдера — портит, для медиатора — убивает эффект. Поэтому «контролировать всё подряд» — ошибка.</p>
    </div>
  )
}
