import { useEffect, useMemo, useRef, useState } from 'react'
import { distributionList, distributions, sampleFrom, cdfAt } from '../lib/distributions.js'

const W = 640
const H = 300
const PAD = 34
const BASE = H - PAD
const TOP = 28
const SAMPLES = 240

const sxOf = (view) => (x) => PAD + ((x - view.xMin) / (view.xMax - view.xMin)) * (W - 2 * PAD)
const syPdf = (view) => (y) => BASE - (Math.min(y, view.yMax) / view.yMax) * (BASE - TOP)
const syCdf = (y) => BASE - y * (BASE - TOP)

// `only` — запереть движок на одном распределении (без дропдауна).
// `allow` — ограничить дропдаун списком id (показать только нужные распределения).
export default function DistributionExplorer({ only, allow, locale = 'ru' }) {
  const en = locale === 'en'
  const [distId, setDistId] = useState(only ?? allow?.[0] ?? 'normal')
  const dist = distributions[distId]
  const [params, setParams] = useState(() =>
    Object.fromEntries(dist.params.map((p) => [p.key, p.default])),
  )
  const [showBands, setShowBands] = useState(false)
  const [mode, setMode] = useState('pdf') // pdf | cdf
  const [samples, setSamples] = useState([])
  const timer = useRef(null)

  function selectDist(id) {
    setDistId(id)
    const d = distributions[id]
    setParams(Object.fromEntries(d.params.map((p) => [p.key, p.default])))
    setSamples([])
  }
  function setParam(key, val) { setParams((s) => ({ ...s, [key]: val })); setSamples([]) }

  useEffect(() => () => clearInterval(timer.current), [])
  function drawN(k) { setSamples((s) => [...s, ...sampleFrom(dist, params, k)]) }
  function animate() {
    clearInterval(timer.current)
    let added = 0
    timer.current = setInterval(() => {
      setSamples((s) => [...s, ...sampleFrom(dist, params, 3)])
      if ((added += 3) >= 180) clearInterval(timer.current)
    }, 40)
  }
  function reset() { clearInterval(timer.current); setSamples([]) }

  const { view } = dist
  const sx = sxOf(view)
  const sy = syPdf(view)
  const meanVal = dist.mean(params)
  const sampleMean = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : null

  // теоретическая кривая (PDF/PMF или CDF)
  const shape = useMemo(() => {
    if (dist.kind === 'discrete') {
      const bars = []
      for (let k = Math.ceil(view.xMin); k <= Math.floor(view.xMax); k++) {
        const prob = dist.fn(k, params)
        if (prob > 0.0004) bars.push({ k, prob, cdf: cdfAt(dist, params, k) })
      }
      return { type: 'discrete', bars }
    }
    const pts = []
    for (let i = 0; i <= SAMPLES; i++) {
      const x = view.xMin + ((view.xMax - view.xMin) * i) / SAMPLES
      pts.push({ x, pdf: dist.fn(x, params), cdf: cdfAt(dist, params, x) })
    }
    return { type: 'cont', pts }
  }, [dist, params, view])

  // гистограмма выборки (нормированная в плотность для PDF-режима)
  const hist = useMemo(() => {
    if (!samples.length) return null
    if (dist.kind === 'discrete') {
      const m = {}
      for (const v of samples) m[v] = (m[v] || 0) + 1
      return { discrete: true, m }
    }
    const BINS = 26
    const binW = (view.xMax - view.xMin) / BINS
    const counts = new Array(BINS).fill(0)
    for (const v of samples) {
      let b = Math.floor((v - view.xMin) / binW)
      if (b >= BINS) b = BINS - 1; if (b < 0) b = 0
      counts[b]++
    }
    return { discrete: false, counts, binW, BINS }
  }, [samples, dist, view])

  // ±σ-полосы 68-95-99.7 (нормальное), медиана (лог-нормальное)
  const bands = distId === 'normal'
    ? [{ k: 3, label: '99.7%', op: 0.05 }, { k: 2, label: '95%', op: 0.08 }, { k: 1, label: '68%', op: 0.12 }]
        .map((b) => ({ ...b, x1: sx(params.mu - b.k * params.sigma), x2: sx(params.mu + b.k * params.sigma) }))
    : null
  const medianX = distId === 'lognormal' ? sx(Math.exp(params.mu)) : null

  const cdfLine = shape.type === 'cont'
    ? shape.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${syCdf(p.cdf).toFixed(1)}`).join(' ')
    : ''
  const pdfLine = shape.type === 'cont'
    ? shape.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.pdf).toFixed(1)}`).join(' ')
    : ''

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        {only ? (
          <span className="text-sm font-medium text-gray-900">{en ? (dist.titleEn ?? dist.title) : dist.title}</span>
        ) : (
          <select value={distId} onChange={(e) => selectDist(e.target.value)} className="min-w-0 flex-1 bg-ink border border-black/15 rounded-md px-3 py-1.5 text-sm">
            {(allow ? allow.map((id) => distributions[id]) : distributionList).map((dd) => <option key={dd.id} value={dd.id}>{en ? (dd.titleEn ?? dd.title) : dd.title}</option>)}
          </select>
        )}
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setMode('pdf')} className={`text-xs px-2 py-1 rounded-md border ${mode === 'pdf' ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{dist.kind === 'discrete' ? 'PMF' : 'PDF'}</button>
          <button onClick={() => setMode('cdf')} className={`text-xs px-2 py-1 rounded-md border ${mode === 'cdf' ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>CDF</button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-2 -mt-1">
        {mode === 'cdf'
          ? (en ? 'CDF — cumulative probability: the height at x = the share of values ≤ x. The line climbs from 0 to 1.' : 'CDF — накопленная вероятность: высота в точке x = доля значений, которые ≤ x. Линия растёт от 0 до 1.')
          : dist.kind === 'discrete'
            ? (en ? 'PMF — probability mass: bar height = the probability of exactly that value. Bars sum to 1.' : 'PMF — функция вероятности: высота столбика = вероятность получить ровно это значение. Сумма всех столбиков = 1.')
            : (en ? 'PDF — density: the height itself is not a probability; the probability of an interval = the area under the curve over it. Total area = 1.' : 'PDF — плотность: сама высота это не вероятность; вероятность попасть в интервал = площадь под кривой на нём. Вся площадь = 1.')}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {mode === 'pdf' && showBands && bands && bands.map((b) => (
          <g key={b.k}>
            <rect x={b.x1} y={TOP} width={b.x2 - b.x1} height={BASE - TOP} fill="#2ab8eb" opacity={b.op} />
            <text x={b.x2 - 3} y={TOP + 12 + (3 - b.k) * 14} fill="#0d7fb0" fontSize="10" textAnchor="end">±{b.k}σ · {b.label}</text>
          </g>
        ))}

        {/* гистограмма выборки */}
        {mode === 'pdf' && hist && !hist.discrete && hist.counts.map((c, k) => {
          if (!c) return null
          const dens = c / (samples.length * hist.binW)
          const x0 = sx(view.xMin + k * hist.binW)
          const x1 = sx(view.xMin + (k + 1) * hist.binW)
          return <rect key={k} x={x0 + 0.5} y={sy(dens)} width={Math.max(0, x1 - x0 - 1)} height={BASE - sy(dens)} fill="#fbbf24" opacity="0.35" />
        })}
        {mode === 'pdf' && hist && hist.discrete && shape.bars.map((b) => {
          const c = hist.m[b.k] || 0; if (!c) return null
          const prop = c / samples.length
          return <rect key={b.k} x={sx(b.k) - 7} y={sy(prop)} width="14" height={BASE - sy(prop)} fill="#fbbf24" opacity="0.35" />
        })}

        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />

        {/* теоретическая кривая */}
        {mode === 'pdf' ? (
          shape.type === 'cont'
            ? <path d={pdfLine} fill="none" stroke="#2ab8eb" strokeWidth="2" />
            : shape.bars.map((b) => <rect key={b.k} x={sx(b.k) - 5} y={sy(b.prob)} width="10" height={BASE - sy(b.prob)} fill="#2ab8eb" rx="1.5" />)
        ) : (
          shape.type === 'cont'
            ? <path d={cdfLine} fill="none" stroke="#2ab8eb" strokeWidth="2" />
            : shape.bars.map((b, i) => {
                const x0 = sx(b.k); const x1 = i + 1 < shape.bars.length ? sx(shape.bars[i + 1].k) : W - PAD
                return <line key={b.k} x1={x0} y1={syCdf(b.cdf)} x2={x1} y2={syCdf(b.cdf)} stroke="#2ab8eb" strokeWidth="2" />
              })
        )}

        {/* среднее / медиана / выборочное среднее */}
        {mode === 'pdf' && Number.isFinite(meanVal) && sx(meanVal) >= PAD && sx(meanVal) <= W - PAD && (
          <line x1={sx(meanVal)} y1={TOP} x2={sx(meanVal)} y2={BASE} stroke="#2ab8eb" strokeWidth="1" strokeDasharray="4 4" />
        )}
        {mode === 'pdf' && medianX != null && medianX >= PAD && medianX <= W - PAD && (
          <line x1={medianX} y1={TOP} x2={medianX} y2={BASE} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {mode === 'pdf' && sampleMean != null && sx(sampleMean) >= PAD && sx(sampleMean) <= W - PAD && (
          <line x1={sx(sampleMean)} y1={TOP} x2={sx(sampleMean)} y2={BASE} stroke="#16a34a" strokeWidth="1.5" />
        )}
        <text x={W - PAD} y={BASE + 22} fill="#9a907c" fontSize="11" textAnchor="end">{mode === 'cdf' ? (en ? 'value → (cumulative probability)' : 'значение → (накопленная вероятность)') : (en ? 'value →' : 'значение →')}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
        <span className="text-[#2ab8eb]">▏ {en ? 'theory' : 'теория'} ({mode === 'cdf' ? 'CDF' : dist.kind === 'discrete' ? 'PMF' : 'PDF'})</span>
        {mode === 'pdf' && <span className="text-[#d9a300]">▮ {en ? 'sample (histogram)' : 'выборка (гистограмма)'}</span>}
        {sampleMean != null && mode === 'pdf' && <span className="text-[#16a34a]">▏ {en ? 'sample mean' : 'среднее выборки'} = {sampleMean.toFixed(2)}</span>}
        <span className="text-gray-500">{en ? 'Mean' : 'Среднее'} ≈ {Number.isFinite(meanVal) ? meanVal.toFixed(2) : '∞'} · {en ? 'values drawn' : 'набрано значений'}: {samples.length}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button onClick={() => drawN(30)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+30 draws' : '+30 выборок'}</button>
        <button onClick={animate} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">{en ? '▶ pour' : '▶ насыпать'}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
        {distId === 'normal' && mode === 'pdf' && (
          <button onClick={() => setShowBands((s) => !s)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">
            {showBands ? (en ? 'hide the three-sigma rule' : 'скрыть правило трёх сигм') : (en ? 'three-sigma rule' : 'правило трёх сигм')}
          </button>
        )}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {dist.params.map((p) => (
          <label key={p.key} className="text-sm">
            <div className="flex justify-between text-gray-700 mb-1">
              <span>{en ? (p.labelEn ?? p.label) : p.label}</span>
              <span className="tabular-nums text-cyanink">{params[p.key]}</span>
            </div>
            <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key]} onChange={(e) => setParam(p.key, Number(e.target.value))} className="w-full accent-accent" />
          </label>
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-600">{en ? (dist.noteEn ?? dist.note) : dist.note} <span className="text-gray-500">{en ? <>Press "pour" — the real sample\'s histogram approaches the theoretical {dist.kind === 'discrete' ? 'PMF' : 'density'}.</> : <>Нажмите «насыпать» — гистограмма реальной выборки приближается к теоретической {dist.kind === 'discrete' ? 'PMF' : 'плотности'}.</>}</span></p>
    </div>
  )
}
