import { useEffect, useMemo, useRef, useState } from 'react'
import { useAutoRun, autoRunClass, autoRunLabel } from '../lib/useAutoRun.js'

// ЦПТ в трёх панелях (как у Seeing Theory):
//  1) генеральная совокупность (скошенная);
//  2) одна выборка — её точки и ВЫБОРОЧНОЕ СРЕДНЕЕ (видно отклонение от истинного);
//  3) распределение выборочных средних — собирается «насыпкой» в колокол.
const W = 560
const H = 340
const PAD = 32
const DOM = 60 // общий домен значений по X
const BINS = 28

export default function SamplingDistribution({ locale = 'ru' }) {
  const en = locale === 'en'
  const POP = useMemo(
    () => Array.from({ length: 800 }, () => Math.min(DOM, Math.max(0, -Math.log(1 - Math.random()) * 11))),
    [],
  )
  const popMean = useMemo(() => POP.reduce((a, b) => a + b, 0) / POP.length, [POP])
  const popSD = useMemo(() => {
    const m2 = POP.reduce((a, b) => a + b * b, 0) / POP.length
    return Math.sqrt(Math.max(0, m2 - popMean * popMean))
  }, [POP, popMean])

  const [n, setN] = useState(10)
  const [means, setMeans] = useState([])
  const [last, setLast] = useState(null) // последняя выборка (точки)
  const timer = useRef(null)
  useEffect(() => () => clearInterval(timer.current), [])
  // Не пустой первый кадр: сразу показываем ОДНУ выборку (панель 2), как и говорит
  // бит 0 («в середине — одна выборка»). Панель 3 остаётся пустой — она «собирается
  // насыпкой», читатель досыпает сам.
  useEffect(() => { one() }, [])

  function one() {
    const s = []
    let sum = 0
    for (let i = 0; i < n; i++) { const v = POP[(Math.random() * POP.length) | 0]; s.push(v); sum += v }
    setLast(s)
    return sum / n
  }
  function drawN(k) {
    const add = []
    let s = null
    for (let i = 0; i < k; i++) {
      let sum = 0; const arr = []
      for (let j = 0; j < n; j++) { const v = POP[(Math.random() * POP.length) | 0]; arr.push(v); sum += v }
      add.push(sum / n); s = arr
    }
    setLast(s)
    setMeans((m) => [...m, ...add])
  }
  // Автопрогон: выборки берутся сами, колокол растёт, пока не остановишь.
  const [running, setRunning] = useAutoRun(() => drawN(1), 60)
  useEffect(() => { if (means.length >= 1500) setRunning(false) }, [means, setRunning])
  function reset() { setRunning(false); clearInterval(timer.current); setMeans([]); setLast(null) }

  const sx = (x) => PAD + (x / DOM) * (W - 2 * PAD)
  const se = popSD / Math.sqrt(n)
  const lastMean = last ? last.reduce((a, b) => a + b, 0) / last.length : null

  // панель 1: гистограмма совокупности
  const popBins = new Array(BINS).fill(0)
  for (const v of POP) { let b = Math.floor((v / DOM) * BINS); if (b >= BINS) b = BINS - 1; popBins[b]++ }
  const popMax = Math.max(...popBins, 1)
  // панель 3: гистограмма средних
  const meanBins = new Array(BINS).fill(0)
  for (const v of means) { let b = Math.floor((v / DOM) * BINS); if (b >= BINS) b = BINS - 1; if (b < 0) b = 0; meanBins[b]++ }
  const meanMax = Math.max(...meanBins, 1)

  const A0 = 16, A1 = 96    // population band
  const B0 = 120, B1 = 168  // sample band
  const C0 = 196, C1 = 312  // means band

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* истинное среднее — общая вертикаль через все панели */}
        <line x1={sx(popMean)} y1={A0} x2={sx(popMean)} y2={C1} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={sx(popMean)} y={A0 - 4} fill="#d9a300" fontSize="10" textAnchor="middle">{en ? 'true mean ' : 'истинное среднее '}{popMean.toFixed(1)}</text>

        {/* панель 1: совокупность */}
        <text x={PAD} y={A0 + 8} fill="#6b7280" fontSize="10">{en ? '1 · population (skewed)' : '1 · генеральная совокупность (скошена)'}</text>
        {popBins.map((c, k) => {
          const h = (c / popMax) * (A1 - A0 - 14)
          return c ? <rect key={k} x={sx((k / BINS) * DOM) + 0.5} y={A1 - h} width={(W - 2 * PAD) / BINS - 1} height={h} fill="#9ca3af" opacity="0.55" /> : null
        })}
        <line x1={PAD} y1={A1} x2={W - PAD} y2={A1} stroke="#d6cebf" strokeWidth="1" />

        {/* панель 2: одна выборка + её среднее */}
        <text x={PAD} y={B0 + 2} fill="#6b7280" fontSize="10">{en ? <>2 · one sample (n = {n}) and its mean</> : <>2 · одна выборка (n = {n}) и её среднее</>}</text>
        {last && last.map((v, i) => <circle key={i} cx={sx(v)} cy={B1 - 10} r="3.5" fill="#2a2f3a" opacity="0.6" />)}
        {lastMean != null && <line x1={sx(lastMean)} y1={B0 + 6} x2={sx(lastMean)} y2={B1} stroke="#16a34a" strokeWidth="2" />}
        {lastMean != null && <text x={sx(lastMean)} y={B0 + 16} fill="#16a34a" fontSize="10" textAnchor="middle">x̄ = {lastMean.toFixed(1)}</text>}
        <line x1={PAD} y1={B1} x2={W - PAD} y2={B1} stroke="#d6cebf" strokeWidth="1" />

        {/* панель 3: распределение средних */}
        <text x={PAD} y={C0 + 2} fill="#6b7280" fontSize="10">{en ? '3 · distribution of sample means → a bell' : '3 · распределение выборочных средних → колокол'}</text>
        {meanBins.map((c, k) => {
          const h = (c / meanMax) * (C1 - C0 - 16)
          return c ? <rect key={k} x={sx((k / BINS) * DOM) + 0.5} y={C1 - h} width={(W - 2 * PAD) / BINS - 1} height={h} fill="#2ab8eb" opacity="0.8" rx="1" /> : null
        })}
        <line x1={PAD} y1={C1} x2={W - PAD} y2={C1} stroke="#d6cebf" strokeWidth="1.5" />
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-700">
        <span>{en ? 'Samples collected' : 'Выборок собрано'}: {means.length}</span>
        <span>n: {n}</span>
        <span className="text-[#2ab8eb]">{en ? 'Standard error' : 'Стандартная ошибка'} σ/√n ≈ {se.toFixed(2)}</span>
        {lastMean != null && <span className="text-[#16a34a]">{en ? 'x̄ deviation from truth' : 'отклонение x̄ от истины'}: {(lastMean - popMean).toFixed(1)}</span>}
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Sample size n' : 'Размер выборки n'}</span><span className="tabular-nums text-cyanink">{n}</span></div>
        <input type="range" min="1" max="60" step="1" value={n} onChange={(e) => { setN(Number(e.target.value)); reset() }} className="w-full accent-accent" />
      </label>

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => drawN(1)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'take a sample' : 'взять выборку'}</button>
        <button onClick={() => drawN(50)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'take 50' : 'взять 50'}</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{autoRunLabel(running, locale)}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>
    </div>
  )
}
