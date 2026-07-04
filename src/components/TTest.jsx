import { useMemo, useState } from 'react'

// t-тест: сравнение двух средних. Разницу делим на её случайную величину
// (стандартную ошибку) → t. Большой |t| → маленький p → разница не случайна.
const W = 560
const H = 170
const PAD = 40
const YA = 66
const YB = 116
const XMIN = 10
const XMAX = 90
const SIGMA = 12

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length

export default function TTest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [diff, setDiff] = useState(10)
  const [n, setN] = useState(20)
  const [tick, setTick] = useState(0)

  const obs = useMemo(() => {
    const samp = (mu) => Array.from({ length: n }, () => mu + randn() * SIGMA)
    const A = samp(50), B = samp(50 + diff)
    const mA = mean(A), mB = mean(B)
    const va = A.reduce((x, y) => x + (y - mA) ** 2, 0) / Math.max(1, n - 1)
    const vb = B.reduce((x, y) => x + (y - mB) ** 2, 0) / Math.max(1, n - 1)
    const se = Math.sqrt((va + vb) / n) || 1e-9
    const t = (mB - mA) / se
    const p = 2 * (1 - cdf(Math.abs(t)))
    return { A, B, mA, mB, t, p }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff, n, tick])

  const sx = (x) => PAD + ((Math.max(XMIN, Math.min(XMAX, x)) - XMIN) / (XMAX - XMIN)) * (W - 2 * PAD)
  const sig = obs.p < 0.05

  const row = (arr, m, y, color, label) => (
    <g>
      <text x={8} y={y + 4} fill="#374151" fontSize="11">{label}</text>
      {arr.map((v, i) => <circle key={i} cx={sx(v)} cy={y} r="3.5" fill={color} opacity="0.5" />)}
      <line x1={sx(m)} y1={y - 14} x2={sx(m)} y2={y + 14} stroke={color} strokeWidth="2" />
    </g>
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {row(obs.A, obs.mA, YA, '#6b7280', 'A')}
        {row(obs.B, obs.mB, YB, '#2ab8eb', 'B')}
      </svg>

      <div className={`mt-1 text-sm ${sig ? 'text-[#2ab8eb]' : 'text-gray-600'}`}>
        {en ? 'Difference of means' : 'Разница средних'}: {(obs.mB - obs.mA).toFixed(1)} · t = {obs.t.toFixed(2)} · p = {obs.p.toFixed(3)} — {sig ? (en ? 'the difference is significant' : 'разница значима') : (en ? 'indistinguishable from chance' : 'не отличить от случайности')}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'True difference of means' : 'Истинная разница средних'}</span><span className="text-cyanink">{diff}</span></div>
          <input type="range" min="0" max="25" step="1" value={diff} onChange={(e) => setDiff(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Group size n' : 'Размер групп n'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="5" max="120" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <button onClick={() => setTick((t) => t + 1)} className="mt-3 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'resample' : 'пересобрать выборку'}</button>
    </div>
  )
}
