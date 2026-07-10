import { useEffect, useState } from 'react'
import { useAutoRun, autoRunClass } from '../lib/useAutoRun.js'

// Последовательный тест = развитие графика подглядывания. Тот же p-value по дням,
// но теперь граница остановки бывает двух видов:
//   • наивный плоский порог 0.05 — проверяем каждый день → под A/A ложные
//     остановки раздуваются далеко за 5% (та самая ошибка из прошлого урока);
//   • последовательная граница (α-spending) — строгая в начале, смягчается к
//     плановому дню → удерживает ложные остановки около честных 5%.
// Пересечение границы под A/A — это ЛОЖНАЯ остановка, а не «эффект».
const W = 560
const H = 210
const PAD = 40
const DAYS = 20
const PERDAY = 110
const DESIGN_DAY = 16
const YCAP = 0.6

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

// граница остановки по дню: плоские 0.05 или α-spending (строго → мягко).
// Коэффициент подобран так, чтобы под A/A общая доля ложных остановок за все
// проверки была около 5% (наивный плоский порог даёт ~23%).
const boundAt = (d, seq) => seq ? Math.max(0.001, 0.035 * (d / DESIGN_DAY) ** 3) : 0.05

function simulate(hasEffect) {
  const pA = 0.20
  const pB = hasEffect ? 0.235 : 0.20
  let cA = 0, cB = 0
  const pts = []
  for (let d = 1; d <= DAYS; d++) {
    for (let u = 0; u < PERDAY; u++) {
      if (Math.random() < pA) cA++
      if (Math.random() < pB) cB++
    }
    const n = d * PERDAY
    const pa = cA / n, pb = cB / n
    const pool = (cA + cB) / (2 * n)
    const se = Math.sqrt(pool * (1 - pool) * (2 / n)) || 1e-9
    pts.push({ d, p: 2 * (1 - cdf(Math.abs((pa - pb) / se))) })
  }
  return { pts, hasEffect }
}
// день первой остановки под границей seq (или null), только до планового дня
function stopDay(pts, seq) {
  for (const pt of pts) { if (pt.d > DESIGN_DAY) break; if (pt.p < boundAt(pt.d, seq)) return pt.d }
  return null
}

export default function SequentialTest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [seq, setSeq] = useState(true) // true — последовательная граница, false — наивная
  const [effect, setEffect] = useState(false)
  const [traj, setTraj] = useState(null)
  const [ghosts, setGhosts] = useState([])
  const [tally, setTally] = useState({ naive: 0, seqStop: 0, total: 0 }) // ложные остановки под A/A

  function run(k) {
    const runs = []
    let naive = 0, seqStop = 0
    for (let r = 0; r < k; r++) {
      const s = simulate(effect)
      runs.push(s)
      if (!effect) { // копим статистику ложных остановок только под A/A
        if (stopDay(s.pts, false) != null) naive++
        if (stopDay(s.pts, true) != null) seqStop++
      }
    }
    setTraj(runs[runs.length - 1])
    setGhosts((g) => [...g, ...runs].slice(-60))
    setTally((t) => ({ naive: t.naive + naive, seqStop: t.seqStop + seqStop, total: t.total + (effect ? 0 : k) }))
  }
  const [running, setRunning] = useAutoRun(() => run(1), 150)
  useEffect(() => { if (tally.total >= 500) setRunning(false) }, [tally, setRunning])
  const reset = () => { setRunning(false); setTraj(null); setGhosts([]); setTally({ naive: 0, seqStop: 0, total: 0 }) }
  const setScenario = (e) => { setEffect(e); setTraj(null); setGhosts([]); setTally({ naive: 0, seqStop: 0, total: 0 }) }

  const sx = (d) => PAD + ((d - 1) / (DAYS - 1)) * (W - 2 * PAD)
  const syP = (p) => 24 + (1 - Math.min(p, YCAP) / YCAP) * (H - 24 - 28)
  const pathOf = (pts) => pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${sx(pt.d).toFixed(1)},${syP(pt.p).toFixed(1)}`).join(' ')

  // граница (только выбранная): плоская 0.05 или кривая α-spending
  let dBound = ''
  if (seq) { for (let d = 1; d <= DESIGN_DAY; d++) dBound += `${d === 1 ? 'M' : 'L'}${sx(d).toFixed(1)},${syP(boundAt(d, true)).toFixed(1)} ` }

  const curStop = traj ? stopDay(traj.pts, seq) : null
  const pct = (v) => (tally.total ? ((v / tally.total) * 100).toFixed(0) + '%' : '—')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* граница остановки — только выбранная */}
        {seq ? (
          <>
            <path d={dBound} fill="none" stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 4" />
            <text x={sx(DESIGN_DAY)} y={syP(0.05) + 13} fill="#c69214" fontSize="10" textAnchor="end">{en ? 'sequential boundary (α-spending)' : 'последовательная граница (α-spending)'}</text>
          </>
        ) : (
          <>
            <rect x={PAD} y={syP(0.05)} width={W - 2 * PAD} height={H - 28 - syP(0.05)} fill="#f87171" opacity="0.06" />
            <line x1={PAD} y1={syP(0.05)} x2={W - PAD} y2={syP(0.05)} stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="5 4" />
            <text x={W - PAD} y={syP(0.05) - 4} fill="#c69214" fontSize="10" textAnchor="end">{en ? 'naive 0.05 threshold' : 'наивный порог 0.05'}</text>
          </>
        )}
        {/* плановый день */}
        <line x1={sx(DESIGN_DAY)} y1={16} x2={sx(DESIGN_DAY)} y2={H - 28} stroke="#2a2f3a" strokeWidth="1.2" strokeDasharray="3 3" />
        <text x={sx(DESIGN_DAY)} y={14} fill="#2a2f3a" fontSize="9" textAnchor="middle">{en ? 'plan (design)' : 'план (дизайн)'}</text>
        <line x1={PAD} y1={H - 28} x2={W - PAD} y2={H - 28} stroke="#d6cebf" strokeWidth="1.5" />

        {/* облако прошлых тестов; красные — те, что пересекли выбранную границу */}
        {ghosts.map((g, gi) => {
          const stopped = stopDay(g.pts, seq) != null
          return <path key={gi} d={pathOf(g.pts)} fill="none" stroke={stopped ? '#f87171' : '#9ca3af'} strokeWidth="1" opacity="0.13" />
        })}
        {/* текущая траектория */}
        {traj && <path d={pathOf(traj.pts)} fill="none" stroke={curStop ? '#f87171' : '#2ab8eb'} strokeWidth="2" />}
        {/* точка остановки */}
        {traj && curStop && (
          <>
            <circle cx={sx(curStop)} cy={syP(traj.pts[curStop - 1].p)} r="5" fill={traj.hasEffect ? '#16a34a' : '#f87171'} />
            <text x={sx(curStop)} y={syP(traj.pts[curStop - 1].p) - 9} fill={traj.hasEffect ? '#16a34a' : '#f87171'} fontSize="10" textAnchor="middle">
              {traj.hasEffect ? (en ? 'early stop' : 'ранняя остановка') : (en ? 'false stop' : 'ложная остановка')}
            </text>
          </>
        )}
        <text x={PAD} y={H - 10} fill="#6b7280" fontSize="10" textAnchor="start">{en ? 'test day (the sample accumulates) →' : 'день теста (выборка копится) →'}</text>
        <text x={PAD} y={12} fill="#6b7280" fontSize="10" textAnchor="start">p-value ↑</text>
      </svg>

      {/* выбор границы */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-xs text-gray-600 mr-1">{en ? 'Stopping boundary:' : 'Граница остановки:'}</span>
        <button onClick={() => setSeq(false)} className={`text-xs px-2.5 py-1 rounded-md border ${!seq ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'naive 0.05 threshold' : 'наивный порог 0.05'}</button>
        <button onClick={() => setSeq(true)} className={`text-xs px-2.5 py-1 rounded-md border ${seq ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'sequential (α-spending)' : 'последовательная (α-spending)'}</button>
      </div>
      {/* сценарий данных */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="text-xs text-gray-600 mr-1">{en ? 'Data:' : 'Данные:'}</span>
        <button onClick={() => setScenario(false)} className={`text-xs px-2.5 py-1 rounded-md border ${!effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'no effect (A/A)' : 'эффекта нет (A/A)'}</button>
        <button onClick={() => setScenario(true)} className={`text-xs px-2.5 py-1 rounded-md border ${effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'effect exists' : 'эффект есть'}</button>
      </div>

      {traj && (
        <div className="mt-2 text-sm text-gray-700">
          {curStop
            ? (traj.hasEffect
              ? <span className="text-[#16a34a]">{en ? `The line crossed the boundary on day ${curStop} — an early stop on a real effect.` : `Линия пробила границу на дне ${curStop} — это ранняя остановка на реальном эффекте.`}</span>
              : <span className="text-[#f87171]">{en ? `There is no effect, but the line dipped under the boundary on day ${curStop} — a FALSE stop, not an effect. A peeker would wrongly declare a "win".` : `Эффекта нет, но линия нырнула под границу на дне ${curStop} — это ЛОЖНАЯ остановка, а не эффект. Подглядывающий ошибочно объявил бы «победу».`}</span>)
            : <span className="text-gray-600">{en ? 'The boundary was not crossed: ' : 'Границу не пробили: '}{traj.hasEffect ? (en ? 'the effect did not reach significance by the deadline.' : 'эффект к сроку не набрал значимости.') : (en ? 'under A/A we honestly reached the planned day with no false stop.' : 'под A/A честно дошли до планового дня без ложной остановки.')}</span>}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={() => run(1)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+1 test' : '+1 тест'}</button>
        <button onClick={() => run(50)} className="text-xs px-3 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+50 tests' : '+50 тестов'}</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{running ? (en ? '⏸ stop' : '⏸ стоп') : (en ? '▶ auto-run' : '▶ автопрогон')}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>

      {/* сравнение долей ложных остановок под A/A */}
      <div className="mt-3 rounded-lg border border-black/10 bg-ink/40 p-3">
        <div className="text-xs text-gray-600 mb-2">{en
          ? 'The share of A/A tests with a false stop (crossed the boundary at least once before the deadline). The honest target is about 5%. Run the "no effect" scenario with the "+50" button.'
          : 'Доля A/A-тестов с ложной остановкой (пересекли границу хоть раз до срока). Честная цель — около 5%. Прогоняйте «эффекта нет» кнопкой «+50».'}</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="text-[#f87171]">{en ? 'naive 0.05 threshold:' : 'наивный порог 0.05:'} <b>{pct(tally.naive)}</b></span>
          <span className="text-[#16a34a]">{en ? 'sequential boundary:' : 'последовательная граница:'} <b>{pct(tally.seqStop)}</b></span>
          <span className="text-gray-500">({en ? 'A/A tests:' : 'A/A-тестов:'} {tally.total})</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-3">{en
        ? 'This is the same day-by-day p-value chart as in the previous lesson, but the stopping boundary is now honest. The naive flat 0.05 threshold is checked every day → under A/A the line keeps dipping under it (red false stops), and their share is far above 5%. The sequential boundary (α-spending) is strict at the start and relaxes toward the planned day → false stops stay around 5%, while a real effect can still be caught before the deadline. Pocock and O’Brien–Fleming are specific families of such boundaries.'
        : 'Это тот же график p-value по дням, что и в прошлом уроке, но граница остановки теперь честная. Наивный плоский порог 0.05 проверяется каждый день → под A/A линия то и дело ныряет под него (красные ложные остановки), и их доля куда больше 5%. Последовательная граница (α-spending) строгая в начале и смягчается к плановому дню → ложных остановок около 5%, при этом настоящий эффект всё ещё можно поймать раньше срока. Pocock и O’Brien–Fleming — конкретные семейства таких границ.'}</p>
    </div>
  )
}
