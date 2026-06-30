import { useState } from 'react'

// Два связанных графика мощности:
// 1) Распределения оценки при H0 (эффекта нет) и H1 (эффект есть). Порог сдвигает
//    границу решения; заливка показывает α (ложное срабатывание) и β (пропуск эффекта).
// 2) Кривая мощности от размера выборки n с целевой линией и маркером текущего n.
// Ползунки разницы, σ, n и α двигают обе картинки сразу — видно, как они связаны.
const W = 560
const HD = 230 // панель распределений
const HP = 200 // панель кривой мощности
const PADX = 46
const TOP = 26
const NMAX = 300

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
function ndtri(p) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const pl = 0.02425
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
  if (p <= 1 - pl) { const q = p - 0.5; const r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1) }
  const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}

export default function PowerCurve() {
  const [diff, setDiff] = useState(3)   // разница средних (эффект, в единицах метрики)
  const [sigma, setSigma] = useState(6) // разброс данных σ
  const [n, setN] = useState(20)        // размер выборки на группу
  const [alpha, setAlpha] = useState(0.05)
  const [target, setTarget] = useState(0.8)

  const zA = ndtri(1 - alpha)
  const se = sigma / Math.sqrt(n)
  const d = diff / sigma
  const power = (nn) => cdf((diff / (sigma / Math.sqrt(nn))) - zA)
  const curPower = power(n)
  const crit = zA * se // критический порог по оси оценки

  // --- Панель 1: распределения H0 / H1 ---
  const base = HD - 40
  const amp = base - TOP
  const xlo = Math.min(-3.8 * se, diff - 3.8 * se)
  const xhi = Math.max(3.8 * se, diff + 3.8 * se)
  const sxD = (x) => PADX + ((x - xlo) / (xhi - xlo)) * (W - 2 * PADX)
  const pdf = (x, m) => Math.exp(-0.5 * ((x - m) / se) ** 2) // пик = 1
  const yD = (v) => base - v * amp

  const STEPS = 180
  const curvePts = (m) => {
    let s = ''
    for (let k = 0; k <= STEPS; k++) {
      const x = xlo + (k / STEPS) * (xhi - xlo)
      s += `${k === 0 ? 'M' : 'L'}${sxD(x).toFixed(1)},${yD(pdf(x, m)).toFixed(1)} `
    }
    return s
  }
  const area = (m, from, to) => {
    let s = `M${sxD(from).toFixed(1)},${base.toFixed(1)} `
    const steps = 80
    for (let k = 0; k <= steps; k++) {
      const x = from + (k / steps) * (to - from)
      s += `L${sxD(x).toFixed(1)},${yD(pdf(x, m)).toFixed(1)} `
    }
    s += `L${sxD(to).toFixed(1)},${base.toFixed(1)} Z`
    return s
  }

  // --- Панель 2: кривая мощности от n ---
  const sx = (nn) => PADX + (nn / NMAX) * (W - 2 * PADX)
  const sy = (p) => HP - 34 - p * (HP - 34 - TOP)
  let dd = ''
  for (let nn = 2; nn <= NMAX; nn += 2) dd += `${nn === 2 ? 'M' : 'L'}${sx(nn).toFixed(1)},${sy(power(nn)).toFixed(1)} `
  let needed = null
  for (let nn = 2; nn <= NMAX; nn++) if (power(nn) >= target) { needed = nn; break }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {/* График 1: H0 vs H1 */}
      <svg viewBox={`0 0 ${W} ${HD}`} className="w-full h-auto select-none">
        <line x1={PADX} y1={base} x2={W - PADX} y2={base} stroke="#d6cebf" strokeWidth="1.5" />
        {/* заливки */}
        <path d={area(0, crit, xhi)} fill="#dc4d4d" opacity="0.30" />
        <path d={area(diff, xlo, crit)} fill="#fbbf24" opacity="0.35" />
        <path d={area(diff, crit, xhi)} fill="#2ab8eb" opacity="0.16" />
        {/* кривые */}
        <path d={curvePts(0)} fill="none" stroke="#9ca3af" strokeWidth="2" />
        <path d={curvePts(diff)} fill="none" stroke="#2ab8eb" strokeWidth="2.5" />
        {/* порог */}
        <line x1={sxD(crit)} y1={TOP - 6} x2={sxD(crit)} y2={base} stroke="#2a2f3a" strokeWidth="1.3" strokeDasharray="4 3" />
        <text x={sxD(crit)} y={TOP - 10} fill="#2a2f3a" fontSize="10" textAnchor="middle">порог решения</text>
        {/* центры */}
        <text x={sxD(0)} y={base + 14} fill="#6b7280" fontSize="10" textAnchor="middle">0 (нет эффекта)</text>
        <text x={sxD(diff)} y={base + 14} fill="#0d7fb0" fontSize="10" textAnchor="middle">разница = {diff}</text>
        <text x={PADX} y={base + 28} fill="#9a907c" fontSize="10" textAnchor="start">оценка разницы между группами →</text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 mb-1">
        <span className="text-gray-500"><span className="inline-block w-3 h-0.5 align-middle bg-[#9ca3af]" /> H0: эффекта нет</span>
        <span className="text-cyanink"><span className="inline-block w-3 h-0.5 align-middle bg-[#2ab8eb]" /> H1: эффект есть</span>
        <span className="text-[#dc4d4d]">■ α — ложное срабатывание ({(alpha * 100).toFixed(0)}%)</span>
        <span className="text-[#c69214]">■ β — пропуск эффекта ({((1 - curPower) * 100).toFixed(0)}%)</span>
        <span className="text-cyanink">■ мощность = 1−β ({(curPower * 100).toFixed(0)}%)</span>
      </div>

      {/* График 2: мощность от n */}
      <svg viewBox={`0 0 ${W} ${HP}`} className="w-full h-auto select-none mt-2">
        <line x1={PADX} y1={HP - 34} x2={W - PADX} y2={HP - 34} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PADX} y1={TOP} x2={PADX} y2={HP - 34} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PADX} y1={sy(target)} x2={W - PADX} y2={sy(target)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={W - PADX} y={sy(target) - 5} fill="#c69214" fontSize="10" textAnchor="end">цель {(target * 100).toFixed(0)}%</text>
        <path d={dd} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        {/* маркер текущего n */}
        <line x1={sx(Math.min(n, NMAX))} y1={TOP} x2={sx(Math.min(n, NMAX))} y2={HP - 34} stroke="#2a2f3a" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={sx(Math.min(n, NMAX))} cy={sy(curPower)} r="4" fill="#2ab8eb" />
        <text x={sx(Math.min(n, NMAX))} y={HP - 20} fill="#2a2f3a" fontSize="10" textAnchor="middle">n = {n}</text>
        <text x={PADX} y={TOP - 12} fill="#6b7280" fontSize="10" textAnchor="start">мощность ↑</text>
        <text x={W - PADX} y={HP - 8} fill="#6b7280" fontSize="10" textAnchor="end">размер выборки n →</text>
      </svg>

      <div className="mt-1 text-sm">
        При текущем n = {n} мощность <span className="text-cyanink font-semibold">{(curPower * 100).toFixed(0)}%</span>.{' '}
        {needed
          ? <>Для цели {(target * 100).toFixed(0)}% нужно <span className="text-cyanink font-semibold">n ≈ {needed}</span> на группу (стандартизованный эффект d = {d.toFixed(2)}).</>
          : <span className="text-gray-600">Эффект слишком мал — {(target * 100).toFixed(0)}% не достигаются даже при n = {NMAX}.</span>}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Разница средних (эффект)</span><span className="text-cyanink">{diff}</span></div>
          <input type="range" min="1" max="12" step="0.5" value={diff} onChange={(e) => setDiff(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Разброс данных σ</span><span className="text-cyanink">{sigma}</span></div>
          <input type="range" min="2" max="14" step="0.5" value={sigma} onChange={(e) => setSigma(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Размер выборки n</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="5" max="300" step="5" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Значимость α</span><span className="text-cyanink">{alpha.toFixed(2)}</span></div>
          <input type="range" min="0.01" max="0.1" step="0.01" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-3">Верхний график — два распределения оценки: серое при «эффекта нет» (H0), синее при «эффект есть» (H1). Порог делит ось на решения: красное справа от порога под H0 — α (приняли шум за эффект), жёлтое слева под H1 — β (проглядели реальный эффект). Меньше σ или больше n сужают колокола и раздвигают их → β падает, мощность растёт. Нижний график собирает это в кривую «мощность от n».</p>
    </div>
  )
}
