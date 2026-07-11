import { useEffect, useState } from 'react'
import { useAutoRun, autoRunClass } from '../lib/useAutoRun.js'

// Последовательный тест = развитие графика подглядывания. Тот же эксперимент по
// дням (выборка копится), но правило остановки бывает трёх видов:
//   • наивный плоский порог 0.05 — проверяем p-value каждый день → под A/A ложные
//     остановки раздуваются далеко за 5% (та самая ошибка из прошлого урока);
//   • α-spending — p-value с движущейся границей (строгая в начале, мягче к сроку),
//     семейство group sequential (Pocock, O'Brien–Fleming) → ложные ≈ 5%;
//   • счётчик улик (SPRT/mSPRT) — вместо p-value копим ОТНОШЕНИЕ ПРАВДОПОДОБИЯ
//     (во сколько раз данные вероятнее «при эффекте», чем «без»). Под H0 это
//     честная игра (martingale, E=1), поэтому шанс дорасти до 20 (=1/α) ≤ 5%
//     при ЛЮБОМ числе взглядов — можно смотреть непрерывно. Порог = 1/α = 20.
const W = 560
const H = 210
const PAD = 40
const DAYS = 20
const PERDAY = 110
const DESIGN_DAY = 16
const YCAP = 0.6
const TAU2 = 0.0025 // дисперсия mSPRT-смеси (√ = 0.05, масштаб ожидаемого эффекта)
const LR_STOP = 20 // граница счётчика улик = 1/α

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

// граница p-value по дню: плоские 0.05 или α-spending (строго → мягко).
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
    const v = (pool * (1 - pool) * (2 / n)) || 1e-12 // дисперсия оценки разницы
    const se = Math.sqrt(v)
    const z2 = ((pa - pb) * (pa - pb)) / v
    // накопленный «счётчик улик» — смешанное отношение правдоподобия (mSPRT).
    // Под H0 это неотрицательный martingale с E=1 → неравенство Вилля: P(sup≥1/α)≤α.
    const lr = Math.sqrt(v / (v + TAU2)) * Math.exp(0.5 * z2 * TAU2 / (v + TAU2))
    pts.push({ d, p: 2 * (1 - cdf(Math.abs((pa - pb) / se))), lr })
  }
  return { pts, hasEffect }
}
// день первой остановки под выбранным режимом (или null).
// naive/alpha — p-value до планового дня; sprt — счётчик улик, смотреть можно ЛЮБОЙ день.
function stopDay(pts, mode) {
  if (mode === 'sprt') { for (const pt of pts) { if (pt.lr >= LR_STOP) return pt.d } return null }
  for (const pt of pts) { if (pt.d > DESIGN_DAY) break; if (pt.p < boundAt(pt.d, mode === 'alpha')) return pt.d }
  return null
}

export default function SequentialTest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [mode, setMode] = useState('alpha') // 'naive' | 'alpha' | 'sprt'
  const [effect, setEffect] = useState(false)
  const [traj, setTraj] = useState(null)
  const [ghosts, setGhosts] = useState([])
  const [tally, setTally] = useState({ naive: 0, alpha: 0, sprt: 0, total: 0 }) // ложные остановки под A/A
  const isSprt = mode === 'sprt'

  function run(k) {
    const runs = []
    let naive = 0, alpha = 0, sprt = 0
    for (let r = 0; r < k; r++) {
      const s = simulate(effect)
      runs.push(s)
      if (!effect) { // статистику ложных остановок копим только под A/A
        if (stopDay(s.pts, 'naive') != null) naive++
        if (stopDay(s.pts, 'alpha') != null) alpha++
        if (stopDay(s.pts, 'sprt') != null) sprt++
      }
    }
    setTraj(runs[runs.length - 1])
    setGhosts((g) => [...g, ...runs].slice(-60))
    setTally((t) => ({ naive: t.naive + naive, alpha: t.alpha + alpha, sprt: t.sprt + sprt, total: t.total + (effect ? 0 : k) }))
  }
  const [running, setRunning] = useAutoRun(() => run(1), 150)
  useEffect(() => { if (tally.total >= 500) setRunning(false) }, [tally, setRunning])
  const reset = () => { setRunning(false); setTraj(null); setGhosts([]); setTally({ naive: 0, alpha: 0, sprt: 0, total: 0 }) }
  const setScenario = (e) => { setEffect(e); setTraj(null); setGhosts([]); setTally({ naive: 0, alpha: 0, sprt: 0, total: 0 }) }

  const sx = (d) => PAD + ((d - 1) / (DAYS - 1)) * (W - 2 * PAD)
  // p-value шкала (naive/alpha)
  const syP = (p) => 24 + (1 - Math.min(p, YCAP) / YCAP) * (H - 24 - 28)
  // лог-шкала счётчика улик (sprt): от 0.04 до 100, порог 20 — у верха
  const LMIN = -1.4, LMAX = 2.0
  const syL = (lr) => {
    const l10 = Math.log10(Math.min(Math.max(lr, 0.04), 100))
    return 24 + (1 - (l10 - LMIN) / (LMAX - LMIN)) * (H - 24 - 28)
  }
  const yOf = (pt) => (isSprt ? syL(pt.lr) : syP(pt.p))
  const pathOf = (pts) => pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${sx(pt.d).toFixed(1)},${yOf(pt).toFixed(1)}`).join(' ')

  // граница α-spending: кривая p-value только в режиме alpha
  let dBound = ''
  if (mode === 'alpha') { for (let d = 1; d <= DESIGN_DAY; d++) dBound += `${d === 1 ? 'M' : 'L'}${sx(d).toFixed(1)},${syP(boundAt(d, true)).toFixed(1)} ` }

  const curStop = traj ? stopDay(traj.pts, mode) : null
  const pct = (v) => (tally.total ? ((v / tally.total) * 100).toFixed(0) + '%' : '—')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* граница остановки — по режиму */}
        {isSprt ? (
          <>
            {/* уровень «улик поровну» (LR = 1) и порог 1/α = 20 */}
            <line x1={PAD} y1={syL(1)} x2={W - PAD} y2={syL(1)} stroke="#d6cebf" strokeWidth="1" strokeDasharray="2 3" />
            <text x={PAD} y={syL(1) - 3} fill="#9ca3af" fontSize="9">{en ? 'evidence even (×1)' : 'улик поровну (×1)'}</text>
            <line x1={PAD} y1={syL(LR_STOP)} x2={W - PAD} y2={syL(LR_STOP)} stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="5 4" />
            <text x={W - PAD} y={syL(LR_STOP) - 4} fill="#c69214" fontSize="10" textAnchor="end">{en ? 'stop line ×20 (=1/α)' : 'граница остановки ×20 (=1/α)'}</text>
          </>
        ) : mode === 'alpha' ? (
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
          const stopped = stopDay(g.pts, mode) != null
          return <path key={gi} d={pathOf(g.pts)} fill="none" stroke={stopped ? '#f87171' : '#9ca3af'} strokeWidth="1" opacity="0.13" />
        })}
        {/* текущая траектория */}
        {traj && <path d={pathOf(traj.pts)} fill="none" stroke={curStop ? '#f87171' : '#2ab8eb'} strokeWidth="2" />}
        {/* точка остановки */}
        {traj && curStop && (
          <>
            <circle cx={sx(curStop)} cy={yOf(traj.pts[curStop - 1])} r="5" fill={traj.hasEffect ? '#16a34a' : '#f87171'} />
            <text x={sx(curStop)} y={yOf(traj.pts[curStop - 1]) - 9} fill={traj.hasEffect ? '#16a34a' : '#f87171'} fontSize="10" textAnchor="middle">
              {traj.hasEffect ? (en ? 'early stop' : 'ранняя остановка') : (en ? 'false stop' : 'ложная остановка')}
            </text>
          </>
        )}
        <text x={PAD} y={H - 10} fill="#6b7280" fontSize="10" textAnchor="start">{en ? 'test day (the sample accumulates) →' : 'день теста (выборка копится) →'}</text>
        <text x={PAD} y={12} fill="#6b7280" fontSize="10" textAnchor="start">{isSprt ? (en ? 'evidence counter (LR) ↑, log scale' : 'счётчик улик (LR) ↑, лог-шкала') : 'p-value ↑'}</text>
      </svg>

      {/* выбор правила остановки */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-xs text-gray-600 mr-1">{en ? 'Stopping rule:' : 'Правило остановки:'}</span>
        <button onClick={() => setMode('naive')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'naive' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'naive 0.05' : 'наивный 0.05'}</button>
        <button onClick={() => setMode('alpha')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'alpha' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>α-spending</button>
        <button onClick={() => setMode('sprt')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'sprt' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'evidence counter (SPRT)' : 'счётчик улик (SPRT)'}</button>
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
              ? <span className="text-[#16a34a]">{isSprt
                ? (en ? `Evidence crossed ×20 on day ${curStop} — an honest early stop on a real effect.` : `Улики пробили ×20 на дне ${curStop} — честная ранняя остановка на реальном эффекте.`)
                : (en ? `The line crossed the boundary on day ${curStop} — an early stop on a real effect.` : `Линия пробила границу на дне ${curStop} — это ранняя остановка на реальном эффекте.`)}</span>
              : <span className="text-[#f87171]">{isSprt
                ? (en ? `There is no effect, but evidence still reached ×20 on day ${curStop} — a rare FALSE stop (happens under 5% of the time).` : `Эффекта нет, но улики всё же дошли до ×20 на дне ${curStop} — редкая ЛОЖНАЯ остановка (случается менее чем в 5%).`)
                : (en ? `There is no effect, but the line dipped under the boundary on day ${curStop} — a FALSE stop, not an effect.` : `Эффекта нет, но линия нырнула под границу на дне ${curStop} — это ЛОЖНАЯ остановка, а не эффект.`)}</span>)
            : <span className="text-gray-600">{isSprt
              ? (traj.hasEffect ? (en ? 'Evidence has not reached ×20 yet — with more data it likely would (sequential is a bit slower in the worst case).' : 'Улики пока не дошли до ×20 — с бóльшими данными, скорее всего, дойдут (последовательный метод в худшем случае чуть медленнее).') : (en ? 'Under A/A the evidence counter stayed low and never reached ×20 — no false stop.' : 'Под A/A счётчик улик остался низким и не дошёл до ×20 — ложной остановки нет.'))
              : (traj.hasEffect ? (en ? 'The boundary was not crossed: the effect did not reach significance by the deadline.' : 'Границу не пробили: эффект к сроку не набрал значимости.') : (en ? 'The boundary was not crossed: under A/A we honestly reached the planned day with no false stop.' : 'Границу не пробили: под A/A честно дошли до планового дня без ложной остановки.'))}</span>}
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={() => run(1)} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+1 test' : '+1 тест'}</button>
        <button onClick={() => run(50)} className="text-xs px-3 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">{en ? '+50 tests' : '+50 тестов'}</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{running ? (en ? '⏸ stop' : '⏸ стоп') : (en ? '▶ auto-run' : '▶ автопрогон')}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>

      {/* сравнение долей ложных остановок под A/A по всем трём правилам */}
      <div className="mt-3 rounded-lg border border-black/10 bg-ink/40 p-3">
        <div className="text-xs text-gray-600 mb-2">{en
          ? 'The share of A/A tests with a false stop (the rule fired at least once, though there is no effect). The honest target is ≤5%. Run the "no effect" scenario with the "+50" button.'
          : 'Доля A/A-тестов с ложной остановкой (правило сработало хоть раз, хотя эффекта нет). Честная цель — ≤5%. Прогоняйте «эффекта нет» кнопкой «+50».'}</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="text-[#f87171]">{en ? 'naive 0.05:' : 'наивный 0.05:'} <b>{pct(tally.naive)}</b></span>
          <span className="text-[#16a34a]">α-spending: <b>{pct(tally.alpha)}</b></span>
          <span className="text-[#16a34a]">{en ? 'evidence ×20 (SPRT):' : 'счётчик улик ×20 (SPRT):'} <b>{pct(tally.sprt)}</b></span>
          <span className="text-gray-500">({en ? 'A/A tests:' : 'A/A-тестов:'} {tally.total})</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-3">{isSprt
        ? (en
          ? 'The evidence counter is the accumulated likelihood ratio: how many times more likely the data is "with an effect" than "without". Under A/A (no effect) it is a fair game — on average it stays flat — so the chance it ever reaches ×20 (=1/α) is ≤5% no matter how long you watch. Stop once it crosses ×20: the error guarantee lives in the rule, not in a fixed sample size, so you may look continuously. This is SPRT / mSPRT (an always-valid p-value = 1 / this counter).'
          : 'Счётчик улик — это накопленное отношение правдоподобия: во сколько раз данные вероятнее «при эффекте», чем «без». Под A/A (эффекта нет) это честная игра — в среднем стоит на месте, — поэтому шанс, что он когда-нибудь дойдёт до ×20 (=1/α), ≤5%, сколько ни смотри. Останавливаемся, как только счётчик пробил ×20: гарантия сидит в правиле, а не в фиксированном размере выборки — потому можно подглядывать непрерывно. Это и есть SPRT / mSPRT (always-valid p-value = 1 / этот счётчик).')
        : (en
          ? 'Same day-by-day view as in the peeking lesson, but the stopping rule is now honest. Naive flat 0.05 is checked every day → under A/A the p-value keeps dipping under it (red false stops), far above 5%. The α-spending boundary is strict early and relaxes toward the planned day → false stops stay near 5% (the group-sequential family: Pocock, O’Brien–Fleming). Switch to "evidence counter (SPRT)" to see the other family.'
          : 'Тот же вид по дням, что в уроке про подглядывание, но правило остановки теперь честное. Наивный плоский 0.05 проверяется каждый день → под A/A p-value то и дело ныряет под него (красные ложные остановки), куда больше 5%. Граница α-spending строгая в начале и мягче к плановому дню → ложных остановок около 5% (семейство group sequential: Pocock, O’Brien–Fleming). Переключите на «счётчик улик (SPRT)», чтобы увидеть второе семейство.')}</p>
    </div>
  )
}
