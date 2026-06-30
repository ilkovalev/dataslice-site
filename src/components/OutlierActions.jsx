import { useMemo, useState } from 'react'

// Выбросы: что с ними делать. Кнопки — оставить / кэп до p95 / винзоризация /
// удалить. Видно, как при этом двигаются среднее и медиана (среднее чувствительно).
const W = 520
const H = 120
const PAD = 36
const BASE = [12, 15, 18, 20, 22, 24, 26, 28, 31, 34, 38, 44, 52, 60] // обычные
const OUTLIER = 280

const ACTIONS = {
  keep: { label: 'оставить', note: 'Реальный выброс оставлен. Среднее раздуто им — для «типичного» берите медиану.' },
  cap: { label: 'кэп до p95', note: 'Экстремум обрезан до p95: наблюдение сохранено, но его влияние ограничено.' },
  winsor: { label: 'винзоризация', note: 'Значение заменено на ближайшее не-экстремальное — мягкая альтернатива удалению.' },
  remove: { label: 'удалить', note: 'Удалять можно лишь явные ошибки. Реальные выбросы удалять = искажать данные; решение фиксируют.' },
}

export default function OutlierActions() {
  const [act, setAct] = useState('keep')
  const full = [...BASE, OUTLIER]
  const data = useMemo(() => {
    if (act === 'remove') return [...BASE]
    if (act === 'cap') { const p95 = 70; return [...BASE, p95] }
    if (act === 'winsor') return [...BASE, BASE[BASE.length - 1]] // заменить на максимум обычных
    return full
  }, [act])

  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const sorted = [...data].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const meanFull = full.reduce((a, b) => a + b, 0) / full.length

  const dmax = 120
  const sx = (v) => PAD + (Math.min(v, dmax) / dmax) * (W - 2 * PAD)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={70} x2={W - PAD} y2={70} stroke="#d6cebf" strokeWidth="1.5" />
        {data.map((v, i) => <circle key={i} cx={sx(v)} cy={70} r="5" fill={v > 100 ? '#dc4d4d' : '#2a2f3a'} opacity="0.6" />)}
        {full.filter((v) => v > 100 && act !== 'keep').map((v, i) => <text key={i} x={W - PAD} y={64} fill="#9ca3af" fontSize="9" textAnchor="end">выброс {v} →{act === 'remove' ? ' удалён' : ' обработан'}</text>)}
        <line x1={sx(mean)} y1={40} x2={sx(mean)} y2={86} stroke="#16a34a" strokeWidth="2" />
        <text x={sx(mean)} y={34} fill="#16a34a" fontSize="10" textAnchor="middle">среднее {mean.toFixed(0)}</text>
        <line x1={sx(median)} y1={54} x2={sx(median)} y2={100} stroke="#fbbf24" strokeWidth="2" />
        <text x={sx(median)} y={112} fill="#d9a300" fontSize="10" textAnchor="middle">медиана {median}</text>
      </svg>

      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(ACTIONS).map(([k, v]) => (
          <button key={k} onClick={() => setAct(k)} className={`text-xs px-2.5 py-1 rounded border ${act === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{v.label}</button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-700">{ACTIONS[act].note}</div>
      <p className="text-xs text-gray-500 mt-2">Сравните: с выбросом среднее ≈ {meanFull.toFixed(0)}, медиана устойчива. Среднее скачет от одного значения, медиана — почти нет. Сначала поймите природу выброса (ошибка или реальность), потом выбирайте действие — и документируйте его.</p>
    </div>
  )
}
