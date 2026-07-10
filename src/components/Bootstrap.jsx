import { useEffect, useRef, useState } from 'react'

// Бутстреп в двух панелях:
//  ВЕРХ — гистограмма исходной (скошенной) выборки. На «шаг» поверх неё
//  насыпаются точки одного ресэмпла (n значений С ВОЗВРАТОМ) и считается их
//  среднее; диагональная связка показывает, как это среднее «падает» вниз.
//  НИЗ  — распределение бутстреп-средних (становится колоколом); 95% между
//  перцентилями = доверительный интервал без формул.
const W = 560
const H = 348
const PAD = 34
const BINS = 24
const TBINS = 16
const TTOP = 40
const TBASE = 150
const BTOP = 214
const BBASE = 328
// скошенная вправо выборка из 15 значений
const SAMPLE = [12, 15, 18, 20, 22, 24, 26, 29, 33, 38, 44, 52, 63, 78, 96]

export default function Bootstrap({ locale = 'ru' }) {
  const en = locale === 'en'
  const [means, setMeans] = useState([])
  const [picked, setPicked] = useState(null) // последний ресэмпл (значения)
  const timer = useRef(null)
  useEffect(() => () => clearInterval(timer.current), [])
  // Не пустой первый кадр: один ресэмпл сразу показывает механику (зелёные точки +
  // «падение» среднего вниз), о которой и говорит бит 0. Колокол дособирается насыпкой.
  useEffect(() => { step() }, [])

  const origMean = SAMPLE.reduce((a, b) => a + b, 0) / SAMPLE.length
  const sMin = Math.min(...SAMPLE)
  const sMax = Math.max(...SAMPLE)

  function resample() {
    const arr = []
    let sum = 0
    for (let i = 0; i < SAMPLE.length; i++) { const v = SAMPLE[(Math.random() * SAMPLE.length) | 0]; arr.push(v); sum += v }
    return { arr, mean: sum / SAMPLE.length }
  }
  function step() { const r = resample(); setPicked(r.arr); setMeans((m) => [...m, r.mean]) }
  function many(k) {
    let last = null
    const add = []
    for (let i = 0; i < k; i++) { const r = resample(); add.push(r.mean); last = r.arr }
    setPicked(last); setMeans((m) => [...m, ...add])
  }
  function animate() {
    clearInterval(timer.current); let c = 0
    timer.current = setInterval(() => { step(); if ((c += 1) >= 40) clearInterval(timer.current) }, 90)
  }
  function reset() { clearInterval(timer.current); setMeans([]); setPicked(null) }

  // верх: домен исходной выборки (с полями)
  const tMin = sMin - 4, tMax = sMax + 4
  const ax = (x) => PAD + ((x - tMin) / (tMax - tMin)) * (W - 2 * PAD)
  // гистограмма исходной выборки
  const tBinW = (tMax - tMin) / TBINS
  const tCounts = new Array(TBINS).fill(0)
  for (const v of SAMPLE) { let k = Math.floor((v - tMin) / tBinW); if (k >= TBINS) k = TBINS - 1; tCounts[k]++ }
  const tMaxC = Math.max(...tCounts, 1)

  // точки текущего ресэмпла, сгруппированные по значению (для стопок)
  const stacks = {}
  if (picked) picked.forEach((v) => { stacks[v] = (stacks[v] || 0) + 1 })
  const pickedMean = picked ? picked.reduce((a, b) => a + b, 0) / picked.length : null

  // низ: домен средних
  const mMin = means.length ? Math.min(...means, origMean) : origMean - 8
  const mMax = means.length ? Math.max(...means, origMean) : origMean + 8
  const mpad = Math.max(1, (mMax - mMin) * 0.1)
  const dMin = mMin - mpad, dMax = mMax + mpad
  const cx = (x) => PAD + ((x - dMin) / (dMax - dMin)) * (W - 2 * PAD)

  const binW = (dMax - dMin) / BINS
  const counts = new Array(BINS).fill(0)
  for (const v of means) { let k = Math.floor((v - dMin) / binW); if (k >= BINS) k = BINS - 1; if (k < 0) k = 0; counts[k]++ }
  const maxC = Math.max(...counts, 1)
  // бин последнего среднего — подсветим
  const lastBin = means.length ? Math.min(BINS - 1, Math.max(0, Math.floor((means[means.length - 1] - dMin) / binW))) : -1

  let ci = null
  if (means.length >= 20) { const s = [...means].sort((a, b) => a - b); const q = (p) => s[Math.floor(p * (s.length - 1))]; ci = [q(0.025), q(0.975)] }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* ВЕРХ: гистограмма исходной выборки */}
        <text x={PAD} y={18} fill="#6b7280" fontSize="10">{en ? 'the original sample (right-skewed) — we draw n values from it with replacement' : 'исходная выборка (скошена вправо) — тянем из неё n значений с возвратом'}</text>
        {tCounts.map((c, k) => {
          const h = (c / tMaxC) * (TBASE - TTOP)
          const x0 = ax(tMin + k * tBinW), x1 = ax(tMin + (k + 1) * tBinW)
          return c ? <rect key={k} x={x0 + 0.5} y={TBASE - h} width={Math.max(0, x1 - x0 - 1)} height={h} fill="#c9c1b1" opacity="0.7" rx="1" /> : null
        })}
        {/* точки текущего ресэмпла — стопками над значением */}
        {Object.entries(stacks).map(([v, cnt]) => (
          Array.from({ length: cnt }).map((_, j) => (
            <circle key={`${v}-${j}`} cx={ax(Number(v))} cy={TBASE - 6 - j * 8} r="3.2" fill="#16a34a" opacity="0.9" />
          ))
        ))}
        <line x1={ax(origMean)} y1={TTOP - 4} x2={ax(origMean)} y2={TBASE} stroke="#6b7280" strokeWidth="1.3" strokeDasharray="4 3" />
        <text x={ax(origMean)} y={TTOP - 8} fill="#6b7280" fontSize="10" textAnchor="middle">{en ? 'sample mean ' : 'среднее выборки '}{origMean.toFixed(1)}</text>
        <line x1={PAD} y1={TBASE} x2={W - PAD} y2={TBASE} stroke="#d6cebf" strokeWidth="1.2" />

        {/* среднее ресэмпла + «падение» вниз */}
        {pickedMean != null && (
          <g>
            <circle cx={ax(pickedMean)} cy={TBASE - 2} r="4.5" fill="#16a34a" />
            <text x={PAD} y={TBASE + 16} fill="#16a34a" fontSize="10">{en ? 'this resample’s mean = ' : 'среднее этого ресэмпла = '}{pickedMean.toFixed(1)}{en ? ' — drops below ↓' : ' — падает вниз ↓'}</text>
            <line x1={ax(pickedMean)} y1={TBASE + 2} x2={cx(pickedMean)} y2={BTOP - 4} stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          </g>
        )}

        {/* НИЗ: распределение бутстреп-средних */}
        <text x={PAD} y={BTOP - 6} fill="#6b7280" fontSize="10">{en ? 'distribution of many resamples’ means → a bell' : 'распределение средних многих ресэмплов → колокол'}</text>
        {counts.map((c, k) => {
          const h = (c / maxC) * (BBASE - BTOP - 6)
          const x0 = cx(dMin + k * binW), x1 = cx(dMin + (k + 1) * binW)
          return c ? <rect key={k} x={x0 + 0.5} y={BBASE - h} width={Math.max(0, x1 - x0 - 1)} height={h} fill={k === lastBin ? '#16a34a' : '#2ab8eb'} opacity="0.8" rx="1" /> : null
        })}
        {ci && [ci[0], ci[1]].map((v, i) => <line key={i} x1={cx(v)} y1={BTOP} x2={cx(v)} y2={BBASE} stroke="#fbbf24" strokeWidth="1.5" />)}
        <line x1={cx(origMean)} y1={BTOP} x2={cx(origMean)} y2={BBASE} stroke="#6b7280" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={PAD} y1={BBASE} x2={W - PAD} y2={BBASE} stroke="#d6cebf" strokeWidth="1.5" />
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-gray-700">{en ? 'Resamples' : 'Ресэмплов'}: {means.length}</span>
        {ci && <span className="text-[#d9a300]">{en ? '95% bootstrap interval' : '95% бутстреп-интервал'}: {ci[0].toFixed(1)} – {ci[1].toFixed(1)}</span>}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
        <span className="text-[#16a34a]">● {en ? 'resample values / latest mean' : 'значения ресэмпла / последнее среднее'}</span>
        <span className="text-[#2ab8eb]">▮ {en ? 'accumulated means' : 'накопленные средние'}</span>
        <span className="text-[#d9a300]">▮ {en ? '95% bounds' : 'границы 95%'}</span>
      </div>

      <div className="mt-2 text-xs text-gray-500">{en ? 'The algorithm: 1) draw n values from the sample with replacement (green dots above) · 2) compute their mean (the green dot) · 3) it drops into the bottom distribution · repeat N times.' : 'Алгоритм: 1) тянем n значений из выборки с возвратом (зелёные точки сверху) · 2) считаем их среднее (зелёная точка) · 3) оно падает в нижнее распределение · повторяем N раз.'}</div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={step} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">{en ? '1 resample (step)' : '1 ресэмпл (шаг)'}</button>
        <button onClick={() => many(200)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? 'resample 200' : 'ресэмпл 200'}</button>
        <button onClick={animate} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">{en ? '▶ pour' : '▶ насыпать'}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>
    </div>
  )
}
