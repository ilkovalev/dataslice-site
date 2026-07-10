import { useEffect, useMemo, useRef, useState } from 'react'

// ХРЕБЕТ курса: любая ОЦЕНКА (среднее, медиана, доля) — сама случайная величина
// со своим распределением. Сверху — совокупность (фиксированная истина),
// снизу — распределение выбранной статистики по многим выборкам.
const W = 560
const H = 300
const PAD = 32
const DOM = 60
const BINS = 28
const STATS = [
  { id: 'mean', label: 'среднее', labelEn: 'mean' },
  { id: 'median', label: 'медиана', labelEn: 'median' },
  { id: 'prop', label: 'доля > 20', labelEn: 'share > 20' },
]

function calc(arr, stat) {
  if (stat === 'mean') return arr.reduce((a, b) => a + b, 0) / arr.length
  if (stat === 'prop') return arr.filter((v) => v > 20).length / arr.length * DOM // масштаб в тот же домен
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

export default function EstimatorSampler({ locale = 'ru' }) {
  const en = locale === 'en'
  const POP = useMemo(() => Array.from({ length: 800 }, () => Math.min(DOM, Math.max(0, -Math.log(1 - Math.random()) * 11))), [])
  const [stat, setStat] = useState('mean')
  const [n, setN] = useState(20)
  const [vals, setVals] = useState([])
  const timer = useRef(null)
  useEffect(() => () => clearInterval(timer.current), [])
  // Не пустой первый кадр: несколько выборок сразу показывают, что оценка «гуляет»
  // (нижняя панель — намёк на разброс). Читатель досыпает и видит, как он сужается с n.
  useEffect(() => { drawN(8) }, [])

  const truth = useMemo(() => calc(POP, stat), [POP, stat])
  function drawN(k) {
    const add = []
    for (let i = 0; i < k; i++) {
      const s = []
      for (let j = 0; j < n; j++) s.push(POP[(Math.random() * POP.length) | 0])
      add.push(calc(s, stat))
    }
    setVals((v) => [...v, ...add])
  }
  function animate() { clearInterval(timer.current); let c = 0; timer.current = setInterval(() => { drawN(2); if ((c += 2) >= 120) clearInterval(timer.current) }, 50) }
  function reset() { clearInterval(timer.current); setVals([]) }
  function pick(s) { reset(); setStat(s) }

  const sx = (x) => PAD + (x / DOM) * (W - 2 * PAD)
  const A0 = 16, A1 = 110, C0 = 150, C1 = 280

  const popBins = new Array(BINS).fill(0)
  for (const v of POP) { let b = Math.floor((v / DOM) * BINS); if (b >= BINS) b = BINS - 1; popBins[b]++ }
  const popMax = Math.max(...popBins, 1)
  const vBins = new Array(BINS).fill(0)
  for (const v of vals) { let b = Math.floor((v / DOM) * BINS); if (b >= BINS) b = BINS - 1; if (b < 0) b = 0; vBins[b]++ }
  const vMax = Math.max(...vBins, 1)
  const lastMean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  const statLabel = STATS.find((s) => s.id === stat)[en ? 'labelEn' : 'label']

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">{en ? 'Estimate:' : 'Оценка:'}</span>
        {STATS.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)} className={`text-xs px-2.5 py-1 rounded-md border ${stat === s.id ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{s.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={sx(truth)} y1={A0} x2={sx(truth)} y2={C1} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={sx(truth)} y={A0 - 4} fill="#d9a300" fontSize="10" textAnchor="middle">{en ? 'truth' : 'истина'} ({statLabel}) = {truth.toFixed(1)}</text>

        <text x={PAD} y={A0 + 8} fill="#6b7280" fontSize="10">{en ? 'population (fixed truth)' : 'совокупность (фиксированная истина)'}</text>
        {popBins.map((c, k) => { const h = (c / popMax) * (A1 - A0 - 14); return c ? <rect key={k} x={sx((k / BINS) * DOM) + 0.5} y={A1 - h} width={(W - 2 * PAD) / BINS - 1} height={h} fill="#9ca3af" opacity="0.55" /> : null })}
        <line x1={PAD} y1={A1} x2={W - PAD} y2={A1} stroke="#d6cebf" strokeWidth="1" />

        <text x={PAD} y={C0 - 2} fill="#6b7280" fontSize="10">{en ? <>distribution of the “{statLabel}” estimate across samples</> : <>распределение оценки «{statLabel}» по выборкам</>}</text>
        {vBins.map((c, k) => { const h = (c / vMax) * (C1 - C0 - 14); return c ? <rect key={k} x={sx((k / BINS) * DOM) + 0.5} y={C1 - h} width={(W - 2 * PAD) / BINS - 1} height={h} fill="#2ab8eb" opacity="0.8" rx="1" /> : null })}
        <line x1={PAD} y1={C1} x2={W - PAD} y2={C1} stroke="#d6cebf" strokeWidth="1.5" />
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-700">
        <span>{en ? 'Samples' : 'Выборок'}: {vals.length}</span>
        <span>n: {n}</span>
        {lastMean != null && <span className="text-[#2ab8eb]">{en ? 'center of estimates' : 'центр оценок'} ≈ {lastMean.toFixed(1)} {en ? '(≈ the truth)' : '(≈ истине)'}</span>}
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Sample size n' : 'Размер выборки n'}</span><span className="tabular-nums text-cyanink">{n}</span></div>
        <input type="range" min="2" max="60" step="1" value={n} onChange={(e) => { setN(Number(e.target.value)); reset() }} className="w-full accent-accent" />
      </label>
      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => drawN(1)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'take a sample' : 'взять выборку'}</button>
        <button onClick={animate} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">{en ? '▶ pour' : '▶ насыпать'}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en ? 'Whichever estimate you pick — every sample has its own, i.e. it is itself random. Its spread falls as n grows. That is the sampling distribution — the object the CLT, intervals and hypothesis testing all stand on.' : 'Какую бы оценку вы ни выбрали — она своя у каждой выборки, то есть сама случайна. Её разброс падает с ростом n. Это и есть выборочное распределение — объект, на котором держатся ЦПТ, интервалы и проверка гипотез.'}</p>
    </div>
  )
}
