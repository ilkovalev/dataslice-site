import { useEffect, useState } from 'react'
import { useAutoRun, autoRunClass } from '../lib/useAutoRun.js'

// A/B-тест: две группы с конверсией и доверительными интервалами. Малая
// выборка → широкие интервалы перекрываются (разницу не отличить от случая).
// Ползунки задают ИСТИННЫЕ конверсии; серия прогонов показывает, как часто
// тест «ловит» заданную разницу — мощность на глаз.
const W = 640
const H = 190
const PAD = 44
const YA = 74
const YB = 122
const XMAX = 0.25 // шкала конверсии 0..25%
const CAP = 400

function randn() {
  let u = 0
  let v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function runExperiment(rateA, rateB, n) {
  const sample = (p) => {
    const c = Math.max(0, Math.min(n, Math.round(p * n + randn() * Math.sqrt(p * (1 - p) * n))))
    const ph = c / n
    const se = Math.sqrt((ph * (1 - ph)) / n)
    return { ph, lo: Math.max(0, ph - 1.96 * se), hi: ph + 1.96 * se }
  }
  return { A: sample(rateA), B: sample(rateB) }
}

export default function ABTest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [rateA, setRateA] = useState(0.1)
  const [rateB, setRateB] = useState(0.12)
  const [n, setN] = useState(500)
  const [obs, setObs] = useState(() => runExperiment(0.1, 0.12, 500))
  const [tally, setTally] = useState({ sep: 0, total: 0 })

  // Смена истинных конверсий или n — новый эксперимент, счёт серий заново.
  useEffect(() => {
    setObs(runExperiment(rateA, rateB, n))
    setTally({ sep: 0, total: 0 })
  }, [rateA, rateB, n])

  function runOnce() {
    const o = runExperiment(rateA, rateB, n)
    setObs(o)
    const sep = o.A.hi < o.B.lo || o.B.hi < o.A.lo
    setTally((t) => ({ sep: t.sep + (sep ? 1 : 0), total: t.total + 1 }))
  }
  const [running, setRunning] = useAutoRun(runOnce, 160)
  useEffect(() => { if (tally.total >= CAP) setRunning(false) }, [tally, setRunning])

  const sx = (x) => PAD + (x / XMAX) * (W - 2 * PAD)
  const overlap = !(obs.A.hi < obs.B.lo || obs.B.hi < obs.A.lo)

  const Row = (o, y, label, color, truth) => (
    <g>
      <text x={8} y={y + 4} fill="#374151" fontSize="12">{label}</text>
      {/* засечка истинной конверсии, заданной ползунком */}
      <line x1={sx(truth)} y1={y - 9} x2={sx(truth)} y2={y + 9} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 2" />
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
        {Row(obs.A, YA, 'A', '#6b7280', rateA)}
        {Row(obs.B, YB, 'B', '#2ab8eb', rateB)}
      </svg>

      <div className={`mt-1 text-sm ${overlap ? 'text-gray-600' : 'text-[#2ab8eb]'}`}>
        {overlap
          ? (en ? 'The intervals overlap — the difference cannot yet be told from chance.' : 'Интервалы перекрываются — разницу пока нельзя отличить от случайности.')
          : (en ? 'The intervals have pulled apart — the difference looks real.' : 'Интервалы разошлись — разница похожа на реальную.')}
        <span className="text-gray-400 text-xs ml-2">{en ? 'yellow tick — the true conversion' : 'жёлтая засечка — истинная конверсия'}</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'True conversion A' : 'Истинная конверсия A'}</span><span className="text-cyanink">{(rateA * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.22" step="0.01" value={rateA} onChange={(e) => setRateA(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'True conversion B' : 'Истинная конверсия B'}</span><span className="text-cyanink">{(rateB * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.22" step="0.01" value={rateB} onChange={(e) => setRateB(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Group size n' : 'Размер групп n'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="50" max="5000" step="50" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={runOnce} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'rerun the experiment' : 'перезапустить эксперимент'}</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{running ? (en ? '⏸ stop' : '⏸ стоп') : (en ? '▶ run a series' : '▶ серия экспериментов')}</button>
        {tally.total > 0 && (
          <span className="text-sm text-gray-700">
            {en ? 'intervals separated in' : 'интервалы разошлись в'} <b className="text-cyanink">{tally.sep}</b> {en ? `of ${tally.total} runs` : `из ${tally.total} прогонов`}
            ({((tally.sep / tally.total) * 100).toFixed(0)}%)
            {rateA === rateB && <span className="text-[#f87171] text-xs ml-1">{en ? '— there is no true difference, these are false positives' : '— истинной разницы нет, это ложные срабатывания'}</span>}
          </span>
        )}
      </div>
    </div>
  )
}
