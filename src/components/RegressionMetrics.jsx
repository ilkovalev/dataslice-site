import { useRef, useState } from 'react'

// Метрики качества регрессии. Точки + линия МНК; панель MAE / RMSE / MAPE / R².
// Кнопка «добавить выброс» наглядно показывает: RMSE штрафует крупные промахи
// сильнее, чем MAE (из-за возведения в квадрат).
const W = 560
const H = 320
const PAD = 38
const DMIN = 0
const DMAX = 100

const BASE = [
  { x: 12, y: 20 }, { x: 22, y: 30 }, { x: 32, y: 34 }, { x: 44, y: 46 },
  { x: 54, y: 50 }, { x: 64, y: 62 }, { x: 74, y: 66 }, { x: 86, y: 80 },
]

export default function RegressionMetrics({ locale = 'ru' }) {
  const en = locale === 'en'
  const [pts, setPts] = useState(BASE)
  const [drag, setDrag] = useState(null)
  const svgRef = useRef(null)

  const sx = (x) => PAD + ((x - DMIN) / (DMAX - DMIN)) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y - DMIN) / (DMAX - DMIN)) * (H - 2 * PAD)
  const toData = (clientX, clientY) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    const py = ((clientY - r.top) / r.height) * H
    const x = ((px - PAD) / (W - 2 * PAD)) * (DMAX - DMIN)
    const y = (1 - (py - PAD) / (H - 2 * PAD)) * (DMAX - DMIN)
    return { x: Math.max(DMIN, Math.min(DMAX, Math.round(x))), y: Math.max(1, Math.min(DMAX, Math.round(y))) }
  }
  function down(i, e) { setDrag(i); svgRef.current.setPointerCapture(e.pointerId) }
  function move(e) {
    if (drag == null) return
    const d = toData(e.clientX, e.clientY)
    setPts((p) => p.map((pt, i) => (i === drag ? d : pt)))
  }
  function up(e) {
    setDrag(null)
    if (svgRef.current.hasPointerCapture?.(e.pointerId)) svgRef.current.releasePointerCapture(e.pointerId)
  }
  const hasOutlier = pts.some((p) => p.x > 90)
  function toggleOutlier() {
    if (hasOutlier) setPts((p) => p.filter((pt) => pt.x <= 90))
    else setPts((p) => [...p, { x: 95, y: 18 }])
  }

  // МНК
  const n = pts.length
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  let sxx = 0
  let sxy = 0
  for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my) }
  const slope = sxx ? sxy / sxx : 0
  const intercept = my - slope * mx
  const lineY = (x) => intercept + slope * x

  // метрики
  let absSum = 0
  let sqSum = 0
  let apeSum = 0
  let ssTot = 0
  for (const p of pts) {
    const e = p.y - lineY(p.x)
    absSum += Math.abs(e)
    sqSum += e * e
    apeSum += Math.abs(e) / Math.max(1, Math.abs(p.y))
    ssTot += (p.y - my) ** 2
  }
  const mae = absSum / n
  const rmse = Math.sqrt(sqSum / n)
  const mape = (apeSum / n) * 100
  const r2 = ssTot ? 1 - sqSum / ssTot : 0

  const metric = (label, value, hint, color) => (
    <div className="rounded-lg border border-black/10 bg-ink px-3 py-2">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className={`text-lg font-mono ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-500 leading-tight">{hint}</div>
    </div>
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none" onPointerMove={move} onPointerUp={up}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {pts.map((p, i) => (
          <line key={`e${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(lineY(p.x))} stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
        ))}
        <line x1={sx(0)} y1={sy(lineY(0))} x2={sx(100)} y2={sy(lineY(100))} stroke="#2ab8eb" strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={drag === i ? 9 : 7} fill={p.x > 90 ? '#f87171' : '#2a2f3a'} stroke="#ffffff" strokeWidth="2" className="cursor-grab" onPointerDown={(e) => down(i, e)} />
        ))}
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {metric('MAE', mae.toFixed(1), en ? 'average |error|' : 'средняя |ошибка|', 'text-gray-900')}
        {metric('RMSE', rmse.toFixed(1), en ? 'punishes outliers' : 'штрафует выбросы', 'text-cyanink')}
        {metric('MAPE', mape.toFixed(0) + '%', en ? 'error in %' : 'ошибка в %', 'text-gray-900')}
        {metric('R²', r2.toFixed(2), en ? 'share explained' : 'доля объяснённого', 'text-gray-900')}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">{en ? 'Drag the points and watch the metrics. RMSE is always ≥ MAE and reacts to an outlier more sharply.' : 'Перетаскивайте точки и следите за метриками. RMSE всегда ≥ MAE и реагирует на выброс резче.'}</p>
        <button onClick={toggleOutlier} className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">
          {hasOutlier ? (en ? 'remove the outlier' : 'убрать выброс') : (en ? 'add an outlier' : 'добавить выброс')}
        </button>
      </div>
    </div>
  )
}
