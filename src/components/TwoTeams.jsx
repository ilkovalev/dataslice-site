import { useRef, useState } from 'react'

// Два отдела с одинаковым средним, но разным разбросом. Среднее (пунктир)
// у обоих на месте, а σ (справа у каждого ряда) — разная. Кнопки «сжать/
// растянуть Б» масштабируют отдел Б вокруг его среднего: σ меняется, центр нет.
const W = 640
const H = 210
const PAD = 40
const XMIN = 0
const XMAX = 100
const YA = 74
const YB = 168

const mean = (p) => p.reduce((a, b) => a + b, 0) / p.length
const std = (p) => {
  const m = mean(p)
  return Math.sqrt(p.reduce((a, b) => a + (b - m) ** 2, 0) / p.length)
}

const L = {
  ru: { mean: 'среднее', shrink: 'сжать Б', stretch: 'растянуть Б', reset: 'сбросить', defA: 'Пиццерия А', defB: 'Пиццерия Б' },
  en: { mean: 'mean', shrink: 'shrink B', stretch: 'stretch B', reset: 'reset', defA: 'Pizzeria A', defB: 'Pizzeria B' },
}

export default function TwoTeams({ unit = '', initialA, initialB, labelA, labelB, locale = 'ru' }) {
  const l = L[locale] ?? L.ru
  labelA = labelA ?? l.defA
  labelB = labelB ?? l.defB
  const baseA = initialA ?? [32, 34, 35, 35, 36, 38]
  const baseB = initialB ?? [14, 24, 33, 37, 46, 56]
  const [A, setA] = useState(() => [...baseA])
  const [B, setB] = useState(() => [...baseB])
  const [drag, setDrag] = useState(null) // { row: 'A'|'B', i }
  const svgRef = useRef(null)

  const sx = (x) => PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD)
  const toData = (clientX) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    return Math.max(XMIN, Math.min(XMAX, Math.round(XMIN + ((px - PAD) / (W - 2 * PAD)) * (XMAX - XMIN))))
  }
  function down(row, i, e) {
    setDrag({ row, i })
    svgRef.current.setPointerCapture(e.pointerId)
  }
  function move(e) {
    if (!drag) return
    const x = toData(e.clientX)
    const upd = (p) => p.map((v, i) => (i === drag.i ? x : v))
    drag.row === 'A' ? setA(upd) : setB(upd)
  }
  function up(e) {
    setDrag(null)
    if (svgRef.current.hasPointerCapture?.(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
  }
  function scaleB(f) {
    setB((p) => {
      const m = mean(p)
      return p.map((v) => Math.max(XMIN, Math.min(XMAX, Math.round(m + (v - m) * f))))
    })
  }

  const u = unit ? ` ${unit}` : ''

  const renderRow = (points, row, y, title) => {
    const m = mean(points)
    const s = std(points)
    return (
      <g>
        <text x={PAD} y={y - 30} fill="#374151" fontSize="12">{title}</text>
        <text x={W - PAD} y={y - 30} fill="#2ab8eb" fontSize="12" textAnchor="end">σ = {s.toFixed(1)}{u}</text>
        <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={sx(m)} y1={y - 22} x2={sx(m)} y2={y} stroke="#2ab8eb" strokeWidth="1.5" strokeDasharray="4 3" />
        {points.map((v, i) => (
          <g key={i}>
            <circle
              cx={sx(v)}
              cy={y}
              r={18}
              fill="transparent"
              className="cursor-grab"
              onPointerDown={(e) => down(row, i, e)}
            />
            <circle
              cx={sx(v)}
              cy={y}
              r={drag && drag.row === row && drag.i === i ? 13 : 10}
              fill="#2a2f3a"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="pointer-events-none"
            />
            <text x={sx(v)} y={y + 22} fill="#6b7280" fontSize="11" textAnchor="middle" className="select-none pointer-events-none">{v}</text>
          </g>
        ))}
      </g>
    )
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none select-none"
        onPointerMove={move}
        onPointerUp={up}
      >
        {renderRow(A, 'A', YA, labelA)}
        {renderRow(B, 'B', YB, labelB)}
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-700">
        <span>{labelA}: {l.mean} {mean(A).toFixed(1)}{u}, σ {std(A).toFixed(1)}{u}</span>
        <span>{labelB}: {l.mean} {mean(B).toFixed(1)}{u}, σ {std(B).toFixed(1)}{u}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={() => scaleB(0.8)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{l.shrink}</button>
        <button onClick={() => scaleB(1.25)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{l.stretch}</button>
        <button onClick={() => { setA([...baseA]); setB([...baseB]) }} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{l.reset}</button>
      </div>
    </div>
  )
}
