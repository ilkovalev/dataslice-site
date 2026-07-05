import { useState } from 'react'

// Парадокс Симпсона: общий тренд направлен в одну сторону, а внутри каждой
// группы — в другую. Переключатель «по группам» показывает разворот.
const W = 520
const H = 300
const PAD = 30

const A = [{ x: 20, y: 60 }, { x: 25, y: 64 }, { x: 30, y: 62 }, { x: 35, y: 68 }, { x: 40, y: 66 }, { x: 45, y: 72 }]
const B = [{ x: 55, y: 40 }, { x: 60, y: 44 }, { x: 65, y: 42 }, { x: 70, y: 48 }, { x: 75, y: 46 }, { x: 80, y: 52 }]

function ols(pts) {
  const n = pts.length
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  let sxx = 0
  let sxy = 0
  for (const p of pts) {
    sxx += (p.x - mx) ** 2
    sxy += (p.x - mx) * (p.y - my)
  }
  const slope = sxx ? sxy / sxx : 0
  return { slope, intercept: my - slope * mx }
}

export default function SimpsonParadox({ locale = 'ru' }) {
  const en = locale === 'en'
  const [grouped, setGrouped] = useState(false)
  const sx = (x) => PAD + (x / 100) * (W - 2 * PAD)
  const sy = (y) => H - PAD - (y / 100) * (H - 2 * PAD)
  const all = [...A, ...B]
  const aggLine = ols(all)
  const lineA = ols(A)
  const lineB = ols(B)
  const seg = (l, color) => (
    <line x1={sx(0)} y1={sy(l.intercept)} x2={sx(100)} y2={sy(l.intercept + l.slope * 100)} stroke={color} strokeWidth="2" />
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {grouped ? (
          <>
            {seg(lineA, '#2ab8eb')}
            {seg(lineB, '#fbbf24')}
            {A.map((p, i) => <circle key={`a${i}`} cx={sx(p.x)} cy={sy(p.y)} r="6" fill="#2ab8eb" />)}
            {B.map((p, i) => <circle key={`b${i}`} cx={sx(p.x)} cy={sy(p.y)} r="6" fill="#fbbf24" />)}
          </>
        ) : (
          <>
            {seg(aggLine, '#6b7280')}
            {all.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill="#2a2f3a" />)}
          </>
        )}
      </svg>

      <div className="mt-2 text-sm text-gray-600">
        {grouped
          ? (en ? 'Within each group the relationship is upward (positive).' : 'Внутри каждой группы связь восходящая (положительная).')
          : (en ? 'Across all the points the relationship is downward (negative).' : 'В целом по всем точкам связь нисходящая (отрицательная).')}
      </div>
      <button onClick={() => setGrouped((g) => !g)} className="mt-3 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">
        {grouped ? (en ? 'show all points together' : 'показать все точки вместе') : (en ? 'split by group' : 'разделить по группам')}
      </button>
    </div>
  )
}
