import { useState } from 'react'

// Z-критерий для двух долей (конверсий) — основной критерий в A/B по конверсии.
// Стандартизуем разницу долей в z и смотрим, насколько она «вылезает» за
// пределы случайного шума стандартного нормального распределения.
const W = 560
const H = 200
const PAD = 36
const BASE = H - PAD
const ZMIN = -4
const ZMAX = 4

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
const phi = (z) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI)

export default function ZTest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [p1, setP1] = useState(0.10)
  const [p2, setP2] = useState(0.12)
  const [n, setN] = useState(2000)

  const pool = (p1 + p2) / 2
  const se = Math.sqrt(pool * (1 - pool) * (2 / n)) || 1e-9
  const z = (p2 - p1) / se
  const pval = 2 * (1 - Phi(Math.abs(z)))
  const sig = pval < 0.05

  const sx = (x) => PAD + ((x - ZMIN) / (ZMAX - ZMIN)) * (W - 2 * PAD)
  const yMax = phi(0)
  const sy = (y) => BASE - (y / yMax) * (H - 2 * PAD)
  let curve = ''
  for (let i = 0; i <= 200; i++) { const x = ZMIN + ((ZMAX - ZMIN) * i) / 200; curve += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(phi(x)).toFixed(1)} ` }
  const tail = (sign) => {
    const a = sign > 0 ? Math.min(ZMAX, Math.abs(z)) : ZMIN
    const b = sign > 0 ? ZMAX : Math.max(ZMIN, -Math.abs(z))
    let d = `M${sx(a).toFixed(1)},${BASE} `
    for (let i = 0; i <= 60; i++) { const x = a + ((b - a) * i) / 60; d += `L${sx(x).toFixed(1)},${sy(phi(x)).toFixed(1)} ` }
    return d + `L${sx(b).toFixed(1)},${BASE} Z`
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <path d={tail(1)} fill="#fbbf24" opacity="0.3" />
        <path d={tail(-1)} fill="#fbbf24" opacity="0.3" />
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={curve} fill="none" stroke="#6b7280" strokeWidth="2" />
        {Math.abs(z) <= ZMAX && <line x1={sx(z)} y1={PAD - 6} x2={sx(z)} y2={BASE} stroke="#2ab8eb" strokeWidth="2" />}
        <text x={sx(Math.max(ZMIN, Math.min(ZMAX, z)))} y={PAD - 10} fill="#2ab8eb" fontSize="11" textAnchor="middle">z = {z.toFixed(2)}</text>
        {[-1.96, 1.96].map((c) => <line key={c} x1={sx(c)} y1={BASE - 6} x2={sx(c)} y2={BASE} stroke="#2a2f3a" strokeWidth="1" />)}
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-[#2ab8eb]">z = {z.toFixed(2)}</span>
        <span className={sig ? 'text-green-600' : 'text-gray-600'}>p-value = {pval < 0.001 ? '<0.001' : pval.toFixed(3)} {sig ? (en ? '→ significant' : '→ значимо') : (en ? '→ not significant' : '→ не значимо')}</span>
        <span className="text-gray-500">{en ? 'difference ' : 'разница '}{((p2 - p1) * 100).toFixed(1)} {en ? 'pp' : 'п.п.'}</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Conversion A' : 'Конверсия A'}</span><span className="text-cyanink">{(p1 * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.3" step="0.005" value={p1} onChange={(e) => setP1(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Conversion B' : 'Конверсия B'}</span><span className="text-cyanink">{(p2 * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.3" step="0.005" value={p2} onChange={(e) => setP2(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'n per group' : 'n на группу'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="100" max="20000" step="100" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en ? 'Conditions: large n, a share metric (conversion). The same difference of shares at large n yields large |z| and small p — sample size decides.' : 'Условия: большие n, метрика-доля (конверсия). Та же разница долей при большом n даёт большой |z| и маленький p — поэтому размер выборки решает.'}</p>
    </div>
  )
}
