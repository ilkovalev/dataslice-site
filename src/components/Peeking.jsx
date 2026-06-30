import { useState } from 'react'

// Подглядывание. Один эксперимент = одна линия p-value по ДНЯМ, пока копится
// выборка. Без эффекта (A/A) p-value блуждает и почти наверняка хоть раз нырнёт
// под 0.05 — соблазн «остановить досрочно». Честно — смотреть только на
// запланированном размере (дизайн). Снизу — накопление трафика к плановому n.
const W = 560
const H1 = 190
const H2 = 120
const PAD = 40
const DAYS = 20
const PERDAY = 110
const DESIGN_DAY = 16 // запланированная длительность по дизайну
const NMAX = DAYS * PERDAY
const DESIGN_N = DESIGN_DAY * PERDAY
const YCAP = 0.6

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

// граница принятия решения по дню: фиксированная 0.05 (обычный тест) или
// последовательная (α-spending) — строгая в начале, смягчается к плановому дню.
const boundAt = (d, sequential) => sequential ? Math.max(0.002, 0.05 * (d / DESIGN_DAY) ** 2) : 0.05

function simulate(hasEffect, sequential) {
  const pA = 0.20
  const pB = hasEffect ? 0.235 : 0.20
  let cA = 0, cB = 0
  const pts = []
  let everBelow = false
  let finalP = 1
  for (let d = 1; d <= DAYS; d++) {
    for (let u = 0; u < PERDAY; u++) {
      if (Math.random() < pA) cA++
      if (Math.random() < pB) cB++
    }
    const n = d * PERDAY
    const pa = cA / n, pb = cB / n
    const pool = (cA + cB) / (2 * n)
    const se = Math.sqrt(pool * (1 - pool) * (2 / n)) || 1e-9
    const pv = 2 * (1 - cdf(Math.abs((pa - pb) / se)))
    pts.push({ d, n, p: pv })
    if (d <= DESIGN_DAY && pv < boundAt(d, sequential)) everBelow = true
    if (d === DESIGN_DAY) finalP = pv
  }
  return { pts, everBelow, finalP, hasEffect }
}

export default function Peeking({ sequential = false }) {
  const [effect, setEffect] = useState(false)
  const [traj, setTraj] = useState(null)
  const [tally, setTally] = useState({ peek: 0, fin: 0, total: 0 })

  function run(k) {
    let last = null, peek = 0, fin = 0
    for (let r = 0; r < k; r++) {
      const s = simulate(effect, sequential)
      last = s
      if (s.everBelow) peek++
      if (s.finalP < 0.05) fin++
    }
    setTraj(last)
    setTally((t) => ({ peek: t.peek + peek, fin: t.fin + fin, total: t.total + k }))
  }
  const reset = () => { setTraj(null); setTally({ peek: 0, fin: 0, total: 0 }) }
  function toggle(e) { setEffect(e); setTraj(null); setTally({ peek: 0, fin: 0, total: 0 }) }

  const sx = (d) => PAD + ((d - 1) / (DAYS - 1)) * (W - 2 * PAD)
  const syP = (p) => 24 + (1 - Math.min(p, YCAP) / YCAP) * (H1 - 24 - 28)
  const syN = (n) => H2 - 26 - (n / NMAX) * (H2 - 26 - 18)
  const dP = traj ? traj.pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${sx(pt.d).toFixed(1)},${syP(pt.p).toFixed(1)}`).join(' ') : ''
  const dN = traj ? traj.pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${sx(pt.d).toFixed(1)},${syN(pt.n).toFixed(1)}`).join(' ') : ''
  // граница решения (для последовательного теста — кривая α-spending)
  const boundPath = []
  for (let d = 1; d <= DESIGN_DAY; d++) boundPath.push(`${d === 1 ? 'M' : 'L'}${sx(d).toFixed(1)},${syP(boundAt(d, sequential)).toFixed(1)}`)
  const dBound = boundPath.join(' ')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {/* График 1: p-value по дням */}
      <svg viewBox={`0 0 ${W} ${H1}`} className="w-full h-auto select-none">
        {!sequential && <rect x={PAD} y={syP(0.05)} width={W - 2 * PAD} height={H1 - 28 - syP(0.05)} fill="#f87171" opacity="0.08" />}
        {sequential ? (
          <>
            <path d={dBound} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 4" />
            <text x={sx(DESIGN_DAY)} y={syP(0.05) + 14} fill="#c69214" fontSize="10" textAnchor="end">граница α-spending</text>
          </>
        ) : (
          <>
            <line x1={PAD} y1={syP(0.05)} x2={W - PAD} y2={syP(0.05)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W - PAD} y={syP(0.05) - 4} fill="#c69214" fontSize="10" textAnchor="end">порог 0.05</text>
          </>
        )}
        {/* линия запланированного размера (дизайн) */}
        <line x1={sx(DESIGN_DAY)} y1={16} x2={sx(DESIGN_DAY)} y2={H1 - 28} stroke="#2a2f3a" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={sx(DESIGN_DAY)} y={14} fill="#2a2f3a" fontSize="9" textAnchor="middle">план (дизайн)</text>
        <line x1={PAD} y1={H1 - 28} x2={W - PAD} y2={H1 - 28} stroke="#d6cebf" strokeWidth="1.5" />
        {traj && <path d={dP} fill="none" stroke={traj.everBelow ? '#f87171' : '#2ab8eb'} strokeWidth="2" />}
        {traj && <circle cx={sx(DESIGN_DAY)} cy={syP(traj.finalP)} r="4" fill={traj.finalP < 0.05 ? '#16a34a' : '#6b7280'} />}
        <text x={PAD} y={H1 - 10} fill="#6b7280" fontSize="10" textAnchor="start">день теста (выборка копится) →</text>
        <text x={PAD} y={12} fill="#6b7280" fontSize="10" textAnchor="start">p-value ↑</text>
      </svg>

      {/* График 2: накопление выборки */}
      <svg viewBox={`0 0 ${W} ${H2}`} className="w-full h-auto select-none mt-1">
        <line x1={PAD} y1={syN(DESIGN_N)} x2={W - PAD} y2={syN(DESIGN_N)} stroke="#2ab8eb" strokeWidth="1.3" strokeDasharray="5 4" />
        <text x={W - PAD} y={syN(DESIGN_N) - 4} fill="#0d7fb0" fontSize="10" textAnchor="end">нужный размер по дизайну ({DESIGN_N})</text>
        <line x1={sx(DESIGN_DAY)} y1={16} x2={sx(DESIGN_DAY)} y2={H2 - 26} stroke="#2a2f3a" strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1={PAD} y1={H2 - 26} x2={W - PAD} y2={H2 - 26} stroke="#d6cebf" strokeWidth="1.5" />
        {traj && <path d={dN} fill="none" stroke="#9ca3af" strokeWidth="2" />}
        <text x={PAD} y={H2 - 9} fill="#6b7280" fontSize="10" textAnchor="start">день теста →</text>
        <text x={PAD} y={14} fill="#6b7280" fontSize="10" textAnchor="start">накоплено наблюдений ↑</text>
      </svg>

      <div className="flex flex-wrap gap-2 mt-2">
        <button onClick={() => toggle(false)} className={`text-xs px-2.5 py-1 rounded border ${!effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>эффекта нет (A/A)</button>
        <button onClick={() => toggle(true)} className={`text-xs px-2.5 py-1 rounded border ${effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>эффект есть</button>
      </div>

      {traj && <div className={`mt-2 text-sm ${traj.everBelow && !traj.hasEffect ? 'text-[#f87171]' : 'text-gray-600'}`}>
        {traj.hasEffect
          ? (traj.finalP < 0.05 ? 'Эффект есть: с ростом выборки p-value устойчиво ушёл под порог — на плановом дне вывод верный.' : 'Эффект есть, но выборки пока не хватило, чтобы он стал значим к плановому дню.')
          : (traj.everBelow ? 'Эффекта НЕТ, но линия ныряла под 0.05 — подглядывающий остановился бы здесь и объявил ложную победу.' : 'Эффекта нет: за весь тест линия не опустилась под порог.')}
      </div>}

      <div className="flex flex-wrap gap-4 mt-2 text-sm">
        <span className="text-[#f87171]">Пересекали границу до плана: {tally.total ? ((tally.peek / tally.total) * 100).toFixed(0) : '—'}%</span>
        <span className="text-[#16a34a]">Значимы строго на плане: {tally.total ? ((tally.fin / tally.total) * 100).toFixed(0) : '—'}%</span>
        <span className="text-gray-500">(прогонов: {tally.total})</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={() => run(1)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">запустить 1 эксперимент</button>
        <button onClick={() => run(50)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">запустить ещё 50</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-600 hover:bg-black/5">сбросить</button>
      </div>
      <p className="text-xs text-gray-500 mt-2">{sequential
        ? 'Жёлтая граница α-spending строгая в начале и смягчается к плановому дню. Останавливаться можно досрочно, но только если линия p-value пробила ЭТУ границу, а не плоские 0.05. Прогоните «эффекта нет» много раз: пересечений мало (общий риск удержан на ~5%) — это и есть честное подглядывание, в отличие от обычного теста с плоским порогом.'
        : 'Одна линия сверху — p-value ОДНОГО эксперимента по дням, пока копится выборка (снизу — как она копится к нужному по дизайну размеру). Без эффекта p-value случайно блуждает и почти наверняка хоть раз нырнёт под 0.05 — но это ложный повод остановиться. Честное правило: смотреть результат на запланированном дне (чёрный пунктир), а не «как только стало значимо».'}</p>
    </div>
  )
}
