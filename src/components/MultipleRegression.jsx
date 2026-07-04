import { useMemo, useState } from 'react'

// Контроль переменных: простая регрессия y~x может врать из-за конфаундера z.
// «Контролировать z» = смотреть связь ВНУТРИ групп по z (это и делает
// множественная регрессия). Тогда видно истинный эффект x, очищенный от z.
const W = 560
const H = 320
const PAD = 36
const DMIN = 0
const DMAX = 100

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
function slope(pts) {
  const n = pts.length
  if (n < 2) return 0
  const mx = pts.reduce((a, p) => a + p.x, 0) / n
  const my = pts.reduce((a, p) => a + p.y, 0) / n
  let sxx = 0, sxy = 0
  for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my) }
  return { b1: sxx ? sxy / sxx : 0, b0: my - (sxx ? sxy / sxx : 0) * mx, mx, my }
}

export default function MultipleRegression() {
  const [control, setControl] = useState(false)
  const [trueEff, setTrueEff] = useState(0.2)
  const [confound, setConfound] = useState(1)
  const noise = useMemo(() => Array.from({ length: 60 }, () => [randn(), randn(), Math.random()]), [])

  // две группы по z; группа 1 сдвинута и по x (правее), и по y (выше) → конфаундинг
  const pts = useMemo(() => noise.map(([nx, ny, u], i) => {
    const g = i % 2 // 0 или 1
    const xBase = g ? 62 : 30
    const x = Math.max(5, Math.min(95, xBase + nx * 12))
    const yGroup = g ? 25 * confound : 0 // конфаундер двигает y по группе
    const y = Math.max(5, Math.min(95, 30 + trueEff * x + yGroup + ny * 7))
    return { x, y, g }
  }), [noise, trueEff, confound])

  const sx = (x) => PAD + ((x - DMIN) / (DMAX - DMIN)) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y - DMIN) / (DMAX - DMIN)) * (H - 2 * PAD)

  const pooled = slope(pts)
  const g0 = slope(pts.filter((p) => p.g === 0))
  const g1 = slope(pts.filter((p) => p.g === 1))
  const colors = ['#9ca3af', '#2ab8eb']

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4.5" fill={colors[p.g]} opacity="0.7" />)}
        {!control && (
          <line x1={sx(0)} y1={sy(pooled.b0)} x2={sx(100)} y2={sy(pooled.b0 + pooled.b1 * 100)} stroke="#dc4d4d" strokeWidth="2.5" />
        )}
        {control && [g0, g1].map((g, i) => (
          <line key={i} x1={sx(i ? 45 : 5)} y1={sy(g.b0 + g.b1 * (i ? 45 : 5))} x2={sx(i ? 95 : 55)} y2={sy(g.b0 + g.b1 * (i ? 95 : 55))} stroke={colors[i]} strokeWidth="2.5" />
        ))}
        <text x={W - PAD} y={H - PAD + 22} fill="#9a907c" fontSize="11" textAnchor="end">x →</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#9ca3af]">● z = 0</span>
        <span className="text-[#2ab8eb]">● z = 1</span>
        {!control
          ? <span className="text-[#dc4d4d]">общий наклон (без контроля): {pooled.b1.toFixed(2)}</span>
          : <span className="text-gray-700">наклон внутри групп: {g0.b1.toFixed(2)} и {g1.b1.toFixed(2)} (истинный эффект ≈ {trueEff.toFixed(2)})</span>}
      </div>

      <button onClick={() => setControl((c) => !c)} className="mt-3 text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">
        {control ? '← убрать контроль z (общая линия)' : 'контролировать z (линии внутри групп)'}
      </button>

      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Истинный эффект x на y</span><span className="text-cyanink">{trueEff.toFixed(2)}</span></div>
          <input type="range" min="0" max="0.6" step="0.05" value={trueEff} onChange={(e) => setTrueEff(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Сила конфаундера z</span><span className="text-cyanink">{confound.toFixed(1)}</span></div>
          <input type="range" min="0" max="2" step="0.1" value={confound} onChange={(e) => setConfound(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">Поставьте истинный эффект = 0 и силу конфаундера побольше: общая красная линия покажет «связь», которой нет. Контроль z (линии внутри групп) её убирает. Это и делает множественная регрессия — оценивает эффект x, удерживая z постоянным.</p>
    </div>
  )
}
