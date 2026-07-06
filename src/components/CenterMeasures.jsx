import { useRef, useState } from 'react'

// Перетаскиваемая числовая прямая: точки → живые метки среднего, медианы, моды.
// Управляется уроком: highlight подсвечивает меру, unit — подпись единиц,
// initial — стартовый набор значений.
const W = 640
const H = 210
const PAD = 44
const XMIN = 0
const XMAX = 100
const LINE_Y = 140

// Цвет + форма + подпись — тройное кодирование каждой меры (различимо и для
// дальтоников). Цвета живут только внутри виджета, не спорят с брендом.
const METRICS = {
  mean: { shape: 'circle', color: '#0d7fb0', label: 'mean' },
  median: { shape: 'diamond', color: '#7c3aed', label: 'median' },
  mode: { shape: 'square', color: '#b45309', label: 'mode' },
}

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

// Разводит близкие подписи: держит минимальный зазор, не выходя за [lo, hi].
// Пин 5 ревью — значения больше не слипаются в «32334538».
function spread(xs, minGap, lo, hi) {
  const n = xs.length
  if (!n) return []
  const order = [...xs.keys()].sort((a, b) => xs[a] - xs[b])
  const pos = order.map((i) => xs[i])
  for (let k = 1; k < n; k++) if (pos[k] < pos[k - 1] + minGap) pos[k] = pos[k - 1] + minGap
  if (pos[n - 1] > hi) {
    pos[n - 1] = hi
    for (let k = n - 2; k >= 0; k--) if (pos[k] > pos[k + 1] - minGap) pos[k] = pos[k + 1] - minGap
  }
  if (pos[0] < lo) {
    pos[0] = lo
    for (let k = 1; k < n; k++) if (pos[k] < pos[k - 1] + minGap) pos[k] = pos[k - 1] + minGap
  }
  const out = new Array(n)
  order.forEach((idx, rank) => (out[order[rank]] = pos[rank]))
  return out
}

function Glyph({ shape, x, y, color, r = 5 }) {
  if (shape === 'diamond') {
    return <path d={`M ${x} ${y - r - 1} L ${x + r + 1} ${y} L ${x} ${y + r + 1} L ${x - r - 1} ${y} Z`} fill={color} />
  }
  if (shape === 'square') {
    return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx="1" fill={color} />
  }
  return <circle cx={x} cy={y} r={r} fill={color} />
}

const L = {
  ru: { mean: 'среднее', median: 'медиана', mode: 'мода', Mean: 'Среднее', Median: 'Медиана', Mode: 'Мода', add: '+ добавить точку', remove: '− убрать точку', reset: 'сбросить' },
  en: { mean: 'mean', median: 'median', mode: 'mode', Mean: 'Mean', Median: 'Median', Mode: 'Mode', add: '+ add a point', remove: '− remove a point', reset: 'reset' },
}

export default function CenterMeasures({ highlight, unit = '', initial, locale = 'ru' }) {
  const l = L[locale] ?? L.ru
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

  // Разводим подписи значений под точками (пин 5).
  const labelX = spread(points.map(sx), 24, PAD, W - PAD)

  // Метки метрик над прямой: раскладываем по строкам, чтобы близкие значения
  // не наезжали друг на друга (пин 4). Каждая метка — форма + название.
  const ROW_Y = [30, 62, 94]
  const markers = [
    { name: 'mean', x: mean },
    { name: 'median', x: median },
    ...modes.map((m) => ({ name: 'mode', x: m })),
  ]
  const rowLastX = []
  const placed = markers
    .map((m) => ({ ...m, px: sx(m.x) }))
    .sort((a, b) => a.px - b.px)
    .map((m) => {
      let row = 0
      while (rowLastX[row] != null && m.px - rowLastX[row] < 96) row++
      rowLastX[row] = m.px
      return { ...m, row: Math.min(row, ROW_Y.length - 1) }
    })

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto touch-none select-none"
        onPointerMove={onMove}
        onPointerUp={onUp}
      >
        {/* числовая прямая */}
        <line x1={PAD} y1={LINE_Y} x2={W - PAD} y2={LINE_Y} stroke="#d6cebf" strokeWidth="1.5" />

        {/* метки метрик над прямой */}
        {placed.map((m, k) => {
          const meta = METRICS[m.name]
          const op = !highlight || highlight === m.name ? 1 : 0.16
          const gy = ROW_Y[m.row] + 8
          const lx = Math.max(PAD + 4, Math.min(W - PAD - 4, m.px))
          return (
            <g key={`${m.name}-${k}`} opacity={op}>
              <line x1={m.px} y1={gy + 6} x2={m.px} y2={LINE_Y} stroke={meta.color} strokeWidth="1.5" strokeDasharray="4 3" />
              <Glyph shape={meta.shape} x={m.px} y={gy} color={meta.color} />
              <text x={lx} y={ROW_Y[m.row] - 5} fill={meta.color} fontSize="11" fontWeight="600" textAnchor="middle">
                {l[m.name]}
              </text>
            </g>
          )
        })}

        {/* точки данных: прозрачная зона захвата под пальцем + видимый кружок */}
        {points.map((v, i) => (
          <g key={i}>
            <circle
              cx={sx(v)}
              cy={LINE_Y}
              r={18}
              fill="transparent"
              className="cursor-grab"
              onPointerDown={(e) => onDown(i, e)}
            />
            <circle
              cx={sx(v)}
              cy={LINE_Y}
              r={drag === i ? 13 : 10}
              fill="#2a2f3a"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="pointer-events-none"
            />
          </g>
        ))}

        {/* подписи значений с выносками (разведены по коллизии) */}
        {points.map((v, i) => {
          const px = sx(v)
          const lx = labelX[i]
          return (
            <g key={`lbl-${i}`} className="pointer-events-none select-none">
              {Math.abs(lx - px) > 1 && (
                <line x1={px} y1={LINE_Y + 12} x2={lx} y2={LINE_Y + 22} stroke="#c9c1b2" strokeWidth="1" />
              )}
              <text x={lx} y={LINE_Y + 34} fill="#6b7280" fontSize="11" textAnchor="middle">{v}</text>
            </g>
          )
        })}
      </svg>

      {/* легенда: те же формы + цвет, что на маркерах */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
        <span className="inline-flex items-center gap-1.5" style={{ color: METRICS.mean.color, opacity: !highlight || highlight === 'mean' ? 1 : 0.4 }}>
          <span aria-hidden>●</span> {l.Mean}: {mean.toFixed(1)}{u}
        </span>
        <span className="inline-flex items-center gap-1.5" style={{ color: METRICS.median.color, opacity: !highlight || highlight === 'median' ? 1 : 0.4 }}>
          <span aria-hidden>◆</span> {l.Median}: {median}{u}
        </span>
        <span className="inline-flex items-center gap-1.5" style={{ color: METRICS.mode.color, opacity: !highlight || highlight === 'mode' ? 1 : 0.4 }}>
          <span aria-hidden>■</span> {l.Mode}: {modes.length ? modes.join(', ') + u : '—'}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPoints((p) => [...p, Math.round(85 + Math.random() * 15)])}
          className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5"
        >
          {l.add}
        </button>
        <button
          onClick={() => setPoints((p) => (p.length > 2 ? p.slice(0, -1) : p))}
          className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5"
        >
          {l.remove}
        </button>
        <button
          onClick={() => setPoints([...base])}
          className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5"
        >
          {l.reset}
        </button>
      </div>
    </div>
  )
}
