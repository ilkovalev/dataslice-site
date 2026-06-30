import { useMemo, useState } from 'react'

// A/B-тест: две группы с конверсией и доверительными интервалами. Малая
// выборка → широкие интервалы перекрываются (разницу не отличить от случая).
const W = 640
const H = 190
const PAD = 44
const YA = 74
const YB = 122
const XMAX = 0.25 // шкала конверсии 0..25%

function randn() {
  let u = 0
  let v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function ABTest() {
  const [rateA, setRateA] = useState(0.1)
  const [rateB, setRateB] = useState(0.12)
  const [n, setN] = useState(500)
  const [tick, setTick] = useState(0)

  const obs = useMemo(() => {
    const sample = (p) => {
      const c = Math.max(0, Math.min(n, Math.round(p * n + randn() * Math.sqrt(p * (1 - p) * n))))
      const ph = c / n
      const se = Math.sqrt((ph * (1 - ph)) / n)
      return { ph, lo: Math.max(0, ph - 1.96 * se), hi: ph + 1.96 * se }
    }
    return { A: sample(rateA), B: sample(rateB) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateA, rateB, n, tick])

  const sx = (x) => PAD + (x / XMAX) * (W - 2 * PAD)
  const overlap = !(obs.A.hi < obs.B.lo || obs.B.hi < obs.A.lo)

  const Row = (o, y, label, color) => (
    <g>
      <text x={8} y={y + 4} fill="#374151" fontSize="12">{label}</text>
      <line x1={sx(o.lo)} y1={y} x2={sx(o.hi)} y2={y} stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1={sx(o.lo)} y1={y - 5} x2={sx(o.lo)} y2={y + 5} stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1={sx(o.hi)} y1={y - 5} x2={sx(o.hi)} y2={y + 5} stroke={color} strokeWidth="2" opacity="0.5" />
      <circle cx={sx(o.ph)} cy={y} r="5" fill={color} />
      <text x={sx(o.ph)} y={y - 12} fill={color} fontSize="11" textAnchor="middle">{(o.ph * 100).toFixed(1)}%</text>
    </g>
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((t) => (
          <text key={t} x={sx(t)} y={H - PAD + 16} fill="#6b7280" fontSize="10" textAnchor="middle">{Math.round(t * 100)}%</text>
        ))}
        {Row(obs.A, YA, 'A', '#6b7280')}
        {Row(obs.B, YB, 'B', '#2ab8eb')}
      </svg>

      <div className={`mt-1 text-sm ${overlap ? 'text-gray-600' : 'text-[#2ab8eb]'}`}>
        {overlap ? 'Интервалы перекрываются — разницу пока нельзя отличить от случайности.' : 'Интервалы разошлись — разница похожа на реальную.'}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Конверсия A</span><span className="text-cyanink">{(rateA * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.22" step="0.01" value={rateA} onChange={(e) => setRateA(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Конверсия B</span><span className="text-cyanink">{(rateB * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.22" step="0.01" value={rateB} onChange={(e) => setRateB(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Размер групп n</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="50" max="5000" step="50" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>

      <div className="mt-3">
        <button onClick={() => setTick((t) => t + 1)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">перезапустить эксперимент</button>
      </div>
    </div>
  )
}
