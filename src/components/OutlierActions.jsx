import { useMemo, useState } from 'react'

// Выбросы: что с ними делать, и как это отражается сразу на трёх видах одних
// данных — точки (со средним и медианой), гистограмма формы и боксплот
// (Q1/медиана/Q3, усы 1.5·IQR, точки-выбросы). Кнопки: оставить / кэп до p95 /
// винзоризация / удалить. Домен адаптивный: убрали выброс — шкала «перезумилась».
const W = 520
const H = 300
const PAD = 40
const HIST_TOP = 40
const HIST_BOT = 120
const BOX_Y = 176
const DOT_Y = 250
const BASE = [12, 15, 18, 20, 22, 24, 26, 28, 31, 34, 38, 44, 52, 60] // обычные зарплаты
const OUTLIER = 280

function quantile(sorted, p) {
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

const ACTIONS = {
  ru: {
    keep: { label: 'оставить', note: 'Реальный выброс оставлен. Среднее раздуто им, боксплот помечает его точкой за усом — для «типичного» берите медиану. Годится, когда выброс важен сам по себе.' },
    cap: { label: 'кэп до p95', note: 'Кэп (клиппинг): всё выше выбранного порога p95 приравнено к самому p95. Наблюдение сохранено, но его влияние ограничено сверху. Для реальных выбросов, которые не хочется терять.' },
    winsor: { label: 'винзоризация', note: 'Винзоризация: крайнее значение заменено на границу «обычных» данных (ближайшее не-выбросовое). По духу как кэп, но обрезает до самого края нормальных значений.' },
    remove: { label: 'удалить', note: 'Удаление: наблюдение выкинуто совсем. Допустимо ТОЛЬКО для явных ошибок (невозможные значения). Реальные выбросы удалять = искажать данные; решение фиксируют.' },
  },
  en: {
    keep: { label: 'keep', note: 'The real outlier stays. It inflates the mean, and the box plot flags it as a dot past the whisker — for a "typical" value use the median. Right when the outlier matters in itself.' },
    cap: { label: 'cap at p95', note: 'Capping (clipping): everything above the chosen threshold p95 is set to p95. The observation survives, its influence is limited from above. For real outliers you do not want to lose.' },
    winsor: { label: 'winsorize', note: 'Winsorizing: the extreme value is replaced with the edge of the "ordinary" data (the nearest non-outlier). Like capping, but clipped to the very edge of normal values.' },
    remove: { label: 'remove', note: 'Removal: the observation is dropped entirely. Acceptable ONLY for clear errors (impossible values). Removing real outliers = distorting the data; document the decision.' },
  },
}
const L = {
  ru: { hist: 'гистограмма формы', box: 'боксплот', dots: 'точки · среднее и медиана', mean: 'среднее', median: 'медиана', out: 'выброс', reset: 'сбросить',
    note: (m) => `Один выброс тянет за собой всё: среднее ≈ ${m}, гистограмма растягивается в длинный хвост, на боксплоте появляется точка за усом. Медиана и «коробка» Q1–Q3 почти не двигаются — они устойчивы. Сначала поймите природу выброса (ошибка или реальность), потом выбирайте действие — и документируйте его.` },
  en: { hist: 'shape histogram', box: 'box plot', dots: 'points · mean and median', mean: 'mean', median: 'median', out: 'outlier', reset: 'reset',
    note: (m) => `One outlier drags everything: the mean is ≈ ${m}, the histogram stretches into a long tail, a dot appears past the whisker on the box plot. The median and the Q1–Q3 box barely move — they are robust. First understand the outlier's nature (error or reality), then pick the action — and document it.` },
}

export default function OutlierActions({ locale = 'ru' }) {
  const A = ACTIONS[locale] ?? ACTIONS.ru
  const l = L[locale] ?? L.ru
  const [act, setAct] = useState('keep')
  const full = [...BASE, OUTLIER]
  const data = useMemo(() => {
    if (act === 'remove') return [...BASE]
    if (act === 'cap') return [...BASE, 70] // p95
    if (act === 'winsor') return [...BASE, BASE[BASE.length - 1]] // на максимум обычных
    return full
  }, [act])

  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const sorted = [...data].sort((a, b) => a - b)
  const median = quantile(sorted, 0.5)
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const inside = sorted.filter((v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
  const whiskLo = Math.min(...inside)
  const whiskHi = Math.max(...inside)
  const outs = sorted.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr)
  const meanFull = full.reduce((a, b) => a + b, 0) / full.length

  // адаптивный домен: с выбросом шкала растянута, без него — «перезумилась»
  const domMax = Math.max(...data) * 1.06
  const sx = (v) => PAD + (v / domMax) * (W - 2 * PAD)

  // гистограмма
  const bins = 16
  const binW = domMax / bins
  const counts = new Array(bins).fill(0)
  for (const v of data) { let k = Math.floor(v / binW); if (k >= bins) k = bins - 1; counts[k]++ }
  const maxC = Math.max(...counts, 1)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* гистограмма формы */}
        <text x={PAD} y={HIST_TOP - 22} fill="#6b7280" fontSize="10">{l.hist}</text>
        {counts.map((c, k) => {
          const h = (c / maxC) * (HIST_BOT - HIST_TOP)
          return c > 0 ? <rect key={k} x={sx(k * binW) + 1} y={HIST_BOT - h} width={Math.max(0, (W - 2 * PAD) / bins - 2)} height={h} fill="#2ab8eb" opacity="0.8" rx="1.5" /> : null
        })}
        <line x1={PAD} y1={HIST_BOT} x2={W - PAD} y2={HIST_BOT} stroke="#d6cebf" strokeWidth="1.5" />

        {/* боксплот */}
        <text x={PAD} y={BOX_Y - 20} fill="#6b7280" fontSize="10">{l.box}</text>
        <line x1={sx(whiskLo)} y1={BOX_Y} x2={sx(whiskHi)} y2={BOX_Y} stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1={sx(whiskLo)} y1={BOX_Y - 6} x2={sx(whiskLo)} y2={BOX_Y + 6} stroke="#0ea5e9" strokeWidth="1.5" />
        <line x1={sx(whiskHi)} y1={BOX_Y - 6} x2={sx(whiskHi)} y2={BOX_Y + 6} stroke="#0ea5e9" strokeWidth="1.5" />
        <rect x={sx(q1)} y={BOX_Y - 13} width={Math.max(1, sx(q3) - sx(q1))} height="26" fill="#0ea5e9" opacity="0.15" stroke="#0ea5e9" strokeWidth="1.2" />
        <line x1={sx(median)} y1={BOX_Y - 13} x2={sx(median)} y2={BOX_Y + 13} stroke="#2ab8eb" strokeWidth="2" />
        {outs.map((o, i) => <circle key={i} cx={sx(o)} cy={BOX_Y} r="4.5" fill="#dc4d4d" />)}

        {/* точки + среднее/медиана */}
        <text x={PAD} y={DOT_Y - 24} fill="#6b7280" fontSize="10">{l.dots}</text>
        <line x1={PAD} y1={DOT_Y} x2={W - PAD} y2={DOT_Y} stroke="#d6cebf" strokeWidth="1.5" />
        {data.map((v, i) => <circle key={i} cx={sx(v)} cy={DOT_Y} r="4.5" fill={outs.includes(v) ? '#dc4d4d' : '#2a2f3a'} opacity="0.6" />)}
        <line x1={sx(mean)} y1={DOT_Y - 18} x2={sx(mean)} y2={DOT_Y + 6} stroke="#16a34a" strokeWidth="2" />
        <line x1={sx(median)} y1={DOT_Y - 6} x2={sx(median)} y2={DOT_Y + 18} stroke="#fbbf24" strokeWidth="2" />
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#16a34a]">▏ {l.mean} {mean.toFixed(0)}</span>
        <span className="text-[#d9a300]">▏ {l.median} {median.toFixed(0)}</span>
        <span className="text-[#0d7fb0]">Q1–Q3: {q1.toFixed(0)}–{q3.toFixed(0)}</span>
        <span className="text-[#dc4d4d]">{l.out}: {outs.length ? outs.map((o) => o.toFixed(0)).join(', ') : '—'}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        {Object.entries(A).map(([k, v]) => (
          <button key={k} onClick={() => setAct(k)} className={`text-xs px-2.5 py-1 rounded-md border ${act === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{v.label}</button>
        ))}
        <button onClick={() => setAct('keep')} className="ml-auto text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-500 hover:bg-black/5">{l.reset}</button>
      </div>
      <div className="mt-2 text-sm text-gray-700">{A[act].note}</div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{l.note(meanFull.toFixed(0))}</p>
    </div>
  )
}
