import { useRef, useState } from 'react'

// Облако точек (перетаскиваются) + линия регрессии (МНК) + остатки + r.
// Тумблер «квадраты ошибок» показывает буквальные квадраты остатков —
// то, что МНК минимизирует. Снизу — уравнение y = b0 + b1·x и коэффициенты.
const W = 560
const H = 340
const PAD = 36
const DMIN = 0
const DMAX = 100

export default function Regression() {
  const [pts, setPts] = useState([
    { x: 18, y: 28 }, { x: 28, y: 38 }, { x: 38, y: 42 }, { x: 50, y: 52 },
    { x: 60, y: 50 }, { x: 70, y: 68 }, { x: 82, y: 74 },
  ])
  const [drag, setDrag] = useState(null)
  const [showSquares, setShowSquares] = useState(false)
  const svgRef = useRef(null)

  const sx = (x) => PAD + ((x - DMIN) / (DMAX - DMIN)) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y - DMIN) / (DMAX - DMIN)) * (H - 2 * PAD)
  const scale = (W - 2 * PAD) / (DMAX - DMIN) // px на единицу данных (оси равны)
  const toData = (clientX, clientY) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    const py = ((clientY - r.top) / r.height) * H
    const x = ((px - PAD) / (W - 2 * PAD)) * (DMAX - DMIN)
    const y = (1 - (py - PAD) / (H - 2 * PAD)) * (DMAX - DMIN)
    return { x: Math.max(DMIN, Math.min(DMAX, Math.round(x))), y: Math.max(DMIN, Math.min(DMAX, Math.round(y))) }
  }
  function down(i, e) {
    setDrag(i)
    svgRef.current.setPointerCapture(e.pointerId)
  }
  function move(e) {
    if (drag == null) return
    const d = toData(e.clientX, e.clientY)
    setPts((p) => p.map((pt, i) => (i === drag ? d : pt)))
  }
  function up(e) {
    setDrag(null)
    if (svgRef.current.hasPointerCapture?.(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
  }

  // МНК + корреляция
  const n = pts.length
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  let sxx = 0
  let syy = 0
  let sxy = 0
  for (const p of pts) {
    sxx += (p.x - mx) ** 2
    syy += (p.y - my) ** 2
    sxy += (p.x - mx) * (p.y - my)
  }
  const slope = sxx ? sxy / sxx : 0
  const intercept = my - slope * mx
  const r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0
  const lineY = (x) => intercept + slope * x
  const sse = pts.reduce((a, p) => a + (p.y - lineY(p.x)) ** 2, 0)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" onPointerMove={move} onPointerUp={up}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <text x={W - PAD} y={H - PAD + 22} fill="#9a907c" fontSize="11" textAnchor="end">x (например, расходы на рекламу) →</text>
        <text x={PAD - 8} y={PAD - 12} fill="#9a907c" fontSize="11">y (продажи)</text>
        {/* квадраты ошибок (то, что минимизирует МНК) */}
        {showSquares && pts.map((p, i) => {
          const yhat = lineY(p.x)
          const err = p.y - yhat // в единицах данных
          const side = Math.abs(err) * scale // сторона квадрата в px
          const topY = Math.min(sy(p.y), sy(yhat))
          // квадрат рисуем влево от точки, сторона = |остаток|
          return <rect key={`sq${i}`} x={sx(p.x) - side} y={topY} width={side} height={side} fill="#fbbf24" opacity="0.18" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5" />
        })}
        {/* остатки */}
        {pts.map((p, i) => (
          <line key={`r${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(lineY(p.x))} stroke="#fbbf24" strokeWidth="1.5" opacity="0.7" />
        ))}
        {/* линия регрессии */}
        <line x1={sx(0)} y1={sy(lineY(0))} x2={sx(100)} y2={sy(lineY(100))} stroke="#2ab8eb" strokeWidth="2" />
        {/* точки */}
        {pts.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={drag === i ? 9 : 7} fill="#2a2f3a" stroke="#ffffff" strokeWidth="2" className="cursor-grab" onPointerDown={(e) => down(i, e)} />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-700">
        <span className="font-mono text-cyanink bg-accent/10 px-2 py-0.5 rounded">y = {intercept.toFixed(1)} + {slope.toFixed(2)}·x</span>
        <span className="text-gray-600">сдвиг b₀ = {intercept.toFixed(1)}</span>
        <span className="text-gray-600">наклон b₁ = {slope.toFixed(2)}</span>
        <span className="text-[#2ab8eb]">r = {r.toFixed(2)}</span>
        {showSquares && <span className="text-[#d9a300]">сумма квадратов = {sse.toFixed(0)}</span>}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">Перетаскивайте точки. Наклон b₁ — на сколько растёт y при +1 по x; r — сила связи от −1 до +1.</p>
        <button onClick={() => setShowSquares((s) => !s)} className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">
          {showSquares ? 'скрыть квадраты' : 'показать квадраты ошибок'}
        </button>
      </div>
    </div>
  )
}
