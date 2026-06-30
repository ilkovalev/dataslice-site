import { useRef, useState } from 'react'

// Перетаскиваемая числовая прямая: точки → живые метки среднего, медианы, моды.
// Управляется уроком: highlight подсвечивает меру, unit — подпись единиц,
// initial — стартовый набор значений.
const W = 640
const H = 170
const PAD = 40
const XMIN = 0
const XMAX = 100
const LINE_Y = 100

function computeStats(points) {
  const n = points.length
  const mean = points.reduce((a, b) => a + b, 0) / n
  const sorted = [...points].sort((a, b) => a - b)
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2
  const counts = {}
  let best = 0
  for (const v of points) {
    counts[v] = (counts[v] || 0) + 1
    if (counts[v] > best) best = counts[v]
  }
  const modes = best > 1 ? Object.keys(counts).filter((k) => counts[k] === best).map(Number) : []
  return { mean, median, modes }
}

export default function CenterMeasures({ highlight, unit = '', initial }) {
  const base = initial ?? [20, 30, 35, 35, 45]
  const [points, setPoints] = useState(() => [...base])
  const [drag, setDrag] = useState(null)
  const svgRef = useRef(null)

  const sx = (x) => PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD)
  const toData = (clientX) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    const x = Math.round(XMIN + ((px - PAD) / (W - 2 * PAD)) * (XMAX - XMIN))
    return Math.max(XMIN, Math.min(XMAX, x))
  }

  function onDown(i, e) {
    setDrag(i)
    svgRef.current.setPointerCapture(e.pointerId)
  }
  function onMove(e) {
    if (drag == null) return
    setPoints((p) => p.map((v, i) => (i === drag ? toData(e.clientX) : v)))
  }
  function onUp(e) {
    setDrag(null)
    if (svgRef.current.hasPointerCapture?.(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
  }

  const u = unit ? ` ${unit}` : ''
  const { mean, median, modes } = computeStats(points)

  const Marker = ({ x, color, label, dy, name }) => {
    const op = !highlight || highlight === name ? 1 : 0.18
    return (
      <g opacity={op}>
        <line x1={sx(x)} y1={28 + dy} x2={sx(x)} y2={LINE_Y} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(x)} y={20 + dy} fill={color} fontSize="11" textAnchor="middle">{label}</text>
      </g>
    )
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        <line x1={PAD} y1={LINE_Y} x2={W - PAD} y2={LINE_Y} stroke="#d6cebf" strokeWidth="1.5" />
        <Marker x={mean} color="#2ab8eb" label="среднее" dy={0} name="mean" />
        <Marker x={median} color="#0ea5e9" label="медиана" dy={median === mean ? 16 : 0} name="median" />
        {modes.map((m) => (
          <Marker key={m} x={m} color="#fbbf24" label="мода" dy={32} name="mode" />
        ))}
        {points.map((v, i) => (
          <g key={i}>
            <circle
              cx={sx(v)}
              cy={LINE_Y}
              r={drag === i ? 10 : 8}
              fill="#2a2f3a"
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-grab"
              onPointerDown={(e) => onDown(i, e)}
            />
            <text x={sx(v)} y={LINE_Y + 24} fill="#6b7280" fontSize="11" textAnchor="middle" className="select-none pointer-events-none">{v}</text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-4 mt-2 text-sm">
        <span className="text-[#2ab8eb]" style={{ opacity: !highlight || highlight === 'mean' ? 1 : 0.4 }}>Среднее: {mean.toFixed(1)}{u}</span>
        <span className="text-[#0ea5e9]" style={{ opacity: !highlight || highlight === 'median' ? 1 : 0.4 }}>Медиана: {median}{u}</span>
        <span className="text-[#fbbf24]" style={{ opacity: !highlight || highlight === 'mode' ? 1 : 0.4 }}>Мода: {modes.length ? modes.join(', ') + u : '—'}</span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPoints((p) => [...p, Math.round(30 + Math.random() * 40)])}
          className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5"
        >
          + добавить точку
        </button>
        <button
          onClick={() => setPoints((p) => (p.length > 2 ? p.slice(0, -1) : p))}
          className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5"
        >
          − убрать точку
        </button>
        <button
          onClick={() => setPoints([...base])}
          className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-600 hover:bg-black/5"
        >
          сбросить
        </button>
      </div>
    </div>
  )
}
