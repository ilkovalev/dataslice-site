import { useState } from 'react'

// Коэффициент корреляции. Левый график — облако точек с крестом средних:
// точки подсвечены по знаку вклада (x−x̄)(y−ȳ) в числитель Пирсона. Правый —
// то же в РАНГАХ: Спирмен = Пирсон, посчитанный по местам, а не значениям.
const W = 300
const H = 250
const PAD = 30
const SETS = {
  linear: { label: 'Линейная', pts: [[1, 2.2], [2, 2.6], [3, 3.4], [4, 3.7], [5, 4.6], [6, 4.9], [7, 5.8], [8, 6.1], [9, 6.9], [10, 7.4]] },
  curve: { label: 'Кривая (парабола)', pts: [[1, 2], [2, 5], [3, 7.5], [4, 9], [5, 9.8], [6, 9.8], [7, 9], [8, 7.5], [9, 5], [10, 2]] },
  outlierMakes: { label: 'Связь из одного выброса', pts: [[1, 5], [1.5, 4.7], [2, 5.3], [2.3, 4.9], [1.8, 5.1], [2.2, 4.8], [1.6, 5.2], [2.4, 5.0], [2, 4.6], [10, 10]] },
  outlierHides: { label: 'Выброс прячет связь', pts: [[1, 1.5], [2, 2.5], [3, 3.2], [4, 4.3], [5, 4.9], [6, 6.0], [7, 6.8], [8, 8.1], [9, 9.0], [4.6, 34]] },
}

function stats(pts) {
  const n = pts.length
  const mx = pts.reduce((a, p) => a + p[0], 0) / n
  const my = pts.reduce((a, p) => a + p[1], 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2 }
  return { mx, my, r: sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0 }
}
function rank(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
  const r = new Array(arr.length)
  idx.forEach(([, i], k) => { r[i] = k + 1 })
  return r
}

function Scatter({ pts, mx, my, signColor, title }) {
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1])
  const xmin = Math.min(...xs), xmax = Math.max(...xs)
  const ymin = Math.min(...ys), ymax = Math.max(...ys)
  const px = (xmax - xmin) * 0.08 || 1, py = (ymax - ymin) * 0.08 || 1
  const sx = (x) => PAD + ((x - (xmin - px)) / ((xmax + px) - (xmin - px))) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y - (ymin - py)) / ((ymax + py) - (ymin - py))) * (H - 2 * PAD)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
      <text x={W / 2} y={14} fill="#6b7280" fontSize="10" textAnchor="middle">{title}</text>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.3" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.3" />
      {/* крест средних */}
      <line x1={sx(mx)} y1={PAD} x2={sx(mx)} y2={H - PAD} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
      <line x1={PAD} y1={sy(my)} x2={W - PAD} y2={sy(my)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
      <text x={sx(mx) + 3} y={PAD + 9} fill="#9ca3af" fontSize="8">x̄, ȳ</text>
      {pts.map(([x, y], i) => {
        const fill = signColor ? ((x - mx) * (y - my) >= 0 ? '#2ab8eb' : '#dc4d4d') : '#2ab8eb'
        return <circle key={i} cx={sx(x)} cy={sy(y)} r="4.5" fill={fill} opacity="0.78" />
      })}
    </svg>
  )
}

export default function CorrelationShapes() {
  const [k, setK] = useState('linear')
  const set = SETS[k]
  const pts = set.pts
  const { mx, my, r } = stats(pts)
  const rx = rank(pts.map((p) => p[0]))
  const ry = rank(pts.map((p) => p[1]))
  const rankPts = rx.map((v, i) => [v, ry[i]])
  const rs = stats(rankPts)
  const rho = rs.r

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(SETS).map(([key, v]) => (
          <button key={key} onClick={() => setK(key)} className={`text-xs px-2.5 py-1 rounded border ${k === key ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{v.label}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Scatter pts={pts} mx={mx} my={my} signColor title="по значениям (Пирсон)" />
        <Scatter pts={rankPts} mx={rs.mx} my={rs.my} title="по рангам / местам (Спирмен)" />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 mb-2">
        <span className="text-cyanink">● тянут связь вверх: (x−x̄)(y−ȳ) &gt; 0</span>
        <span className="text-[#dc4d4d]">● тянут вниз: (x−x̄)(y−ȳ) &lt; 0</span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-[#2ab8eb]">Пирсон r = {r.toFixed(2)}</span>
        <span className="text-gray-700">Спирмен ρ = {rho.toFixed(2)}</span>
      </div>

      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-3 py-2 text-sm space-y-1">
        <div className="font-mono text-gray-700 text-xs">Пирсон: r = Σ(x−x̄)(y−ȳ) / √( Σ(x−x̄)²·Σ(y−ȳ)² )</div>
        <div className="font-mono text-gray-700 text-xs">Спирмен: ρ = тот же Пирсон, но по рангам rₓ, r_y (а не по значениям)</div>
      </div>

      <p className="text-xs text-gray-500 mt-2">Пирсон складывает «прямоугольники» (x−x̄)(y−ȳ): синие (обе координаты по одну сторону от среднего) тянут r вверх, красные — вниз; сумму нормируют на разброс. Спирмен делает то же, но сначала заменяет значения их РАНГАМИ (местами) — поэтому он ловит любую монотонную связь и устойчив к выбросам: на «Выброс прячет связь» Пирсон проваливается к нулю, а Спирмен по рангам остаётся высоким.</p>
    </div>
  )
}
