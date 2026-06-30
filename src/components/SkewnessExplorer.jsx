import { useMemo, useState } from 'react'

// Явная визуализация скошенности. Слайдер α морфит распределение из
// левоскошенного через симметричное в правоскошенное (skew-normal).
// Видно, как длинный хвост тянет СРЕДНЕЕ в сторону хвоста, а МЕДИАНА
// остаётся у пика — главный практический смысл скоса.
const W = 560
const H = 250
const PAD = 34
const BASE = H - PAD
const TOP = 24
const XMIN = -4
const XMAX = 4
const N = 240

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const phi = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
const Phi = (x) => 0.5 * (1 + erf(x / Math.SQRT2))
const skewPdf = (x, a) => 2 * phi(x) * Phi(a * x)

export default function SkewnessExplorer() {
  const [alpha, setAlpha] = useState(4)
  const sx = (x) => PAD + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD)

  const { d, yMax, mean, median, mode } = useMemo(() => {
    const xs = []
    let yMax = 0
    for (let i = 0; i <= N; i++) {
      const x = XMIN + ((XMAX - XMIN) * i) / N
      const y = skewPdf(x, alpha)
      xs.push({ x, y })
      if (y > yMax) yMax = y
    }
    // аналитическое среднее skew-normal
    const delta = alpha / Math.sqrt(1 + alpha * alpha)
    const mean = delta * Math.sqrt(2 / Math.PI)
    // мода — argmax, медиана — где накопленная площадь = 0.5
    let mode = xs[0].x
    let best = 0
    let area = 0
    let median = XMIN
    const step = (XMAX - XMIN) / N
    let half = false
    for (let i = 0; i < xs.length; i++) {
      if (xs[i].y > best) { best = xs[i].y; mode = xs[i].x }
      area += xs[i].y * step
      if (!half && area >= 0.5) { median = xs[i].x; half = true }
    }
    return { d: xs, yMax, mean, median, mode }
  }, [alpha])

  const sy = (y) => BASE - (y / (yMax * 1.05)) * (BASE - TOP)
  const path = d.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')
  const fill = `${path} L${sx(XMAX)},${BASE} L${sx(XMIN)},${BASE} Z`
  const dir = alpha > 0.3 ? 'вправо' : alpha < -0.3 ? 'влево' : 'симметрично'

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <path d={fill} fill="#2ab8eb" opacity="0.10" />
        <path d={path} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        {/* мода / медиана / среднее */}
        <line x1={sx(mode)} y1={TOP} x2={sx(mode)} y2={BASE} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 3" />
        <text x={sx(mode)} y={TOP - 4} fill="#6b7280" fontSize="10" textAnchor="middle">мода</text>
        <line x1={sx(median)} y1={TOP} x2={sx(median)} y2={BASE} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(median)} y={BASE + 14} fill="#d9a300" fontSize="10" textAnchor="middle">медиана</text>
        <line x1={sx(mean)} y1={TOP} x2={sx(mean)} y2={BASE} stroke="#16a34a" strokeWidth="1.5" />
        <text x={sx(mean)} y={BASE + 26} fill="#16a34a" fontSize="10" textAnchor="middle">среднее</text>
      </svg>

      <div className="text-sm text-gray-700 mt-1">
        Хвост тянется <span className="text-cyanink font-medium">{dir}</span>. Среднее = {mean.toFixed(2)}, медиана = {median.toFixed(2)}, мода = {mode.toFixed(2)}.
        {Math.abs(alpha) > 0.3 && <> Порядок «мода → медиана → среднее» указывает направление скоса.</>}
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Скошенность (α): влево ← симметрия → вправо</span><span className="tabular-nums text-cyanink">{alpha}</span></div>
        <input type="range" min="-8" max="8" step="1" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="w-full accent-accent" />
      </label>
    </div>
  )
}
