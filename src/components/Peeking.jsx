import { useEffect, useState } from 'react'
import { useAutoRun, autoRunClass } from '../lib/useAutoRun.js'

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

export default function Peeking({ sequential = false, locale = 'ru' }) {
  const en = locale === 'en'
  const [effect, setEffect] = useState(false)
  const [traj, setTraj] = useState(null)
  const [ghosts, setGhosts] = useState([]) // бледные траектории прошлых тестов
  const [tally, setTally] = useState({ peek: 0, fin: 0, total: 0 })

  function run(k) {
    const runs = []
    let peek = 0, fin = 0
    for (let r = 0; r < k; r++) {
      const s = simulate(effect, sequential)
      runs.push(s)
      if (s.everBelow) peek++
      if (s.finalP < 0.05) fin++
    }
    setTraj(runs[runs.length - 1])
    setGhosts((g) => [...g, ...runs].slice(-60)) // копим «облако» траекторий
    setTally((t) => ({ peek: t.peek + peek, fin: t.fin + fin, total: t.total + k }))
  }
  const [running, setRunning] = useAutoRun(() => run(1), 150)
  useEffect(() => { if (tally.total >= 500) setRunning(false) }, [tally, setRunning])
  const reset = () => { setRunning(false); setTraj(null); setGhosts([]); setTally({ peek: 0, fin: 0, total: 0 }) }
  function toggle(e) { setRunning(false); setEffect(e); setTraj(null); setGhosts([]); setTally({ peek: 0, fin: 0, total: 0 }) }

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
            <text x={sx(DESIGN_DAY)} y={syP(0.05) + 14} fill="#c69214" fontSize="10" textAnchor="end">{en ? 'α-spending boundary' : 'граница α-spending'}</text>
          </>
        ) : (
          <>
            <line x1={PAD} y1={syP(0.05)} x2={W - PAD} y2={syP(0.05)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W - PAD} y={syP(0.05) - 4} fill="#c69214" fontSize="10" textAnchor="end">{en ? 'threshold 0.05' : 'порог 0.05'}</text>
          </>
        )}
        {/* линия запланированного размера (дизайн) */}
        <line x1={sx(DESIGN_DAY)} y1={16} x2={sx(DESIGN_DAY)} y2={H1 - 28} stroke="#2a2f3a" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={sx(DESIGN_DAY)} y={14} fill="#2a2f3a" fontSize="9" textAnchor="middle">{en ? 'plan (design)' : 'план (дизайн)'}</text>
        <line x1={PAD} y1={H1 - 28} x2={W - PAD} y2={H1 - 28} stroke="#d6cebf" strokeWidth="1.5" />
        {/* облако прошлых тестов: каждая бледная линия — отдельный A/A-эксперимент */}
        {ghosts.map((g, gi) => (
          <path key={gi} d={g.pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${sx(pt.d).toFixed(1)},${syP(pt.p).toFixed(1)}`).join(' ')}
            fill="none" stroke={g.everBelow ? '#f87171' : '#9ca3af'} strokeWidth="1" opacity="0.13" />
        ))}
        {traj && <path d={dP} fill="none" stroke={traj.everBelow ? '#f87171' : '#2ab8eb'} strokeWidth="2" />}
        {traj && <circle cx={sx(DESIGN_DAY)} cy={syP(traj.finalP)} r="4" fill={traj.finalP < 0.05 ? '#16a34a' : '#6b7280'} />}
        <text x={PAD} y={H1 - 10} fill="#6b7280" fontSize="10" textAnchor="start">{en ? 'test day (the sample accumulates) →' : 'день теста (выборка копится) →'}</text>
        <text x={PAD} y={12} fill="#6b7280" fontSize="10" textAnchor="start">p-value ↑</text>
      </svg>

      {/* График 2: накопление выборки */}
      <svg viewBox={`0 0 ${W} ${H2}`} className="w-full h-auto select-none mt-1">
        <line x1={PAD} y1={syN(DESIGN_N)} x2={W - PAD} y2={syN(DESIGN_N)} stroke="#2ab8eb" strokeWidth="1.3" strokeDasharray="5 4" />
        <text x={W - PAD} y={syN(DESIGN_N) - 4} fill="#0d7fb0" fontSize="10" textAnchor="end">{en ? `required size by design (${DESIGN_N})` : `нужный размер по дизайну (${DESIGN_N})`}</text>
        <line x1={sx(DESIGN_DAY)} y1={16} x2={sx(DESIGN_DAY)} y2={H2 - 26} stroke="#2a2f3a" strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1={PAD} y1={H2 - 26} x2={W - PAD} y2={H2 - 26} stroke="#d6cebf" strokeWidth="1.5" />
        {traj && <path d={dN} fill="none" stroke="#9ca3af" strokeWidth="2" />}
        <text x={PAD} y={H2 - 9} fill="#6b7280" fontSize="10" textAnchor="start">{en ? 'test day →' : 'день теста →'}</text>
        <text x={PAD} y={14} fill="#6b7280" fontSize="10" textAnchor="start">{en ? 'observations accumulated ↑' : 'накоплено наблюдений ↑'}</text>
      </svg>

      <div className="flex flex-wrap gap-2 mt-2">
        <button onClick={() => toggle(false)} className={`text-xs px-2.5 py-1 rounded-md border ${!effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'no effect (A/A)' : 'эффекта нет (A/A)'}</button>
        <button onClick={() => toggle(true)} className={`text-xs px-2.5 py-1 rounded-md border ${effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'effect exists' : 'эффект есть'}</button>
      </div>

      {traj && <div className={`mt-2 text-sm ${traj.everBelow && !traj.hasEffect ? 'text-[#f87171]' : 'text-gray-600'}`}>
        {traj.hasEffect
          ? (traj.finalP < 0.05
            ? (en ? 'The effect exists: as the sample grew, the p-value went stably under the threshold — the conclusion on the planned day is correct.' : 'Эффект есть: с ростом выборки p-value устойчиво ушёл под порог — на плановом дне вывод верный.')
            : (en ? 'The effect exists, but the sample was not yet enough for it to become significant by the planned day.' : 'Эффект есть, но выборки пока не хватило, чтобы он стал значим к плановому дню.'))
          : (traj.everBelow
            ? (en ? 'There is NO effect, but the line dipped under 0.05 — a peeker would have stopped here and declared a false win.' : 'Эффекта НЕТ, но линия ныряла под 0.05 — подглядывающий остановился бы здесь и объявил ложную победу.')
            : (en ? 'No effect: over the whole test the line never dropped under the threshold.' : 'Эффекта нет: за весь тест линия не опустилась под порог.'))}
      </div>}

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => run(1)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+1 test (one trajectory)' : '+1 тест (одна траектория)'}</button>
        <button onClick={() => run(50)} className="text-xs px-3 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+50 tests' : '+50 тестов'}</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{running ? (en ? '⏸ stop' : '⏸ стоп') : (en ? '▶ auto-run' : '▶ автопрогон')}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>

      {/* итоговая статистика по многим тестам — ради этого и жмут «+50» */}
      <div className="mt-3 rounded-lg border border-black/10 bg-ink/40 p-3">
        <div className="text-xs text-gray-600 mb-2">{en
          ? 'One test is one random trajectory (the bold line; past ones form the pale "cloud"). To see HOW OFTEN peeking produces a false "win", you need to run many tests — that is what the "+50" button is for.'
          : 'Один тест — одна случайная траектория (её видно жирной линией, прошлые — бледным «облаком»). Чтобы увидеть, КАК ЧАСТО подглядывание даёт ложную «победу», нужно прогнать много тестов — для этого и кнопка «+50».'}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[#f87171]">{en ? 'dipped under the threshold before the deadline at least once:' : 'хоть раз ныряли под порог до срока:'} <b>{tally.total ? ((tally.peek / tally.total) * 100).toFixed(0) : '—'}%</b></span>
          <span className="text-[#16a34a]">{en ? 'significant strictly on the planned day:' : 'значимы строго на плановом дне:'} {tally.total ? ((tally.fin / tally.total) * 100).toFixed(0) : '—'}%</span>
          <span className="text-gray-500">({en ? 'tests:' : 'тестов:'} {tally.total})</span>
        </div>
        {!effect && tally.total > 0 && (
          <div className="text-xs text-[#f87171] mt-1">{en
            ? `There is no effect, so the honest share of false "wins" should be ~5%. See how much peeking inflates it: ${((tally.peek / tally.total) * 100).toFixed(0)}% vs 5%.`
            : `Эффекта нет, честная доля ложных «побед» должна быть ~5%. Видите, насколько подглядывание её раздувает: ${((tally.peek / tally.total) * 100).toFixed(0)}% против 5%.`}</div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">{sequential
        ? (en
          ? 'The yellow α-spending boundary is strict at the start and relaxes toward the planned day. You may stop early, but only if the p-value line crosses THIS boundary — not the flat 0.05.'
          : 'Жёлтая граница α-spending строгая в начале и смягчается к плановому дню. Останавливаться можно досрочно, но только если линия p-value пробила ЭТУ границу, а не плоские 0.05.')
        : (en
          ? 'The top chart is the p-value day by day as the sample accumulates (below — how it grows toward the required size). With no effect, the p-value wanders at random and will almost surely dip under 0.05 at least once — but that is a false reason to stop. The honest rule: read the result on the planned day (the black dashes), not "as soon as it turns significant".'
          : 'Верхний график — p-value по дням, пока копится выборка (снизу — как она копится к нужному размеру). Без эффекта p-value случайно блуждает и почти наверняка хоть раз нырнёт под 0.05 — но это ложный повод остановиться. Честное правило: смотреть результат на плановом дне (чёрный пунктир), а не «как только стало значимо».')}</p>
    </div>
  )
}
