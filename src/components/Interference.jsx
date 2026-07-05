import { useState } from 'react'

// Сетевые эффекты: при сплите ПО ПОЛЬЗОВАТЕЛЯМ связанные люди попадают в разные
// группы → эффект «протекает» в контроль (красные связи = заражение). Кластерная
// рандомизация (целые сообщества в одну ветку) убирает межгрупповые связи.
const W = 460
const H = 250
const POS = [
  [70, 60], [130, 40], [110, 110], [60, 150], [140, 170], [90, 200], // кластер L
  [320, 60], [390, 45], [350, 110], [410, 150], [330, 175], [400, 200], // кластер R
]
const EDGES = [
  [0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [3, 5],
  [6, 7], [7, 8], [6, 8], [8, 9], [9, 10], [10, 11], [9, 11],
  [2, 8], [5, 6], // межкластерные связи
]
const USER = ['A', 'B', 'A', 'B', 'A', 'B', 'B', 'A', 'B', 'A', 'B', 'A']

const TRUE_EFFECT = 10 // истинный лифт метрики от B (в усл. единицах)

export default function Interference({ locale = 'ru' }) {
  const en = locale === 'en'
  const [cluster, setCluster] = useState(false)
  const grp = cluster ? POS.map((_, i) => (i < 6 ? 'A' : 'B')) : USER
  const color = (g) => (g === 'A' ? '#9ca3af' : '#2ab8eb')
  const contaminated = EDGES.filter(([a, b]) => grp[a] !== grp[b]).length
  // наивная оценка эффекта смещается из-за «протекания»: эффект B перетекает к
  // друзьям из контроля, контроль подрастает, и наблюдаемая разница B−A занижается.
  const contFrac = contaminated / EDGES.length
  const naiveEffect = TRUE_EFFECT * (1 - 0.8 * contFrac)
  const gap = TRUE_EFFECT - naiveEffect
  // второй график — сравнение двух оценок
  const BW = 460, BH = 120, BPAD = 40
  const barMax = TRUE_EFFECT * 1.15
  const bx = (v) => BPAD + (v / barMax) * (BW - 2 * BPAD)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        {EDGES.map(([a, b], i) => {
          const bad = grp[a] !== grp[b]
          return <line key={i} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke={bad ? '#dc4d4d' : '#d6cebf'} strokeWidth={bad ? 2.5 : 1.5} />
        })}
        {POS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="11" fill={color(grp[i])} stroke="#fff" strokeWidth="1.5" />
            <text x={x} y={y + 4} fill="#fff" fontSize="10" textAnchor="middle">{grp[i]}</text>
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#9ca3af]">● A ({en ? 'control' : 'контроль'})</span>
        <span className="text-[#2ab8eb]">● B ({en ? 'test' : 'тест'})</span>
        <span className={contaminated > 4 ? 'text-[#dc4d4d]' : 'text-green-600'}>{en ? 'contaminated links (A↔B):' : 'заражённых связей (A↔B):'} {contaminated} {en ? 'of' : 'из'} {EDGES.length}</span>
      </div>

      <button onClick={() => setCluster((c) => !c)} className="mt-3 text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">
        {cluster ? (en ? '← user split' : '← сплит по пользователям') : (en ? 'cluster randomization' : 'кластерная рандомизация')}
      </button>

      {/* Второй график: как ОБНАРУЖИТЬ нарушение SUTVA — сравнить два дизайна */}
      <div className="mt-4 text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'How to check SUTVA: compare the estimate under two designs' : 'Как проверить SUTVA: сравните оценку в двух дизайнах'}</div>
      <svg viewBox={`0 0 ${BW} ${BH}`} className="w-full h-auto select-none">
        <line x1={BPAD} y1={BH - 26} x2={BW - BPAD} y2={BH - 26} stroke="#d6cebf" strokeWidth="1.5" />
        {/* истинный эффект (кластерная) */}
        <rect x={BPAD} y={22} width={bx(TRUE_EFFECT) - BPAD} height="22" fill="#16a34a" opacity="0.55" rx="2" />
        <text x={BPAD + 4} y={37} fill="#0a7a33" fontSize="10">{en ? `cluster (clean): effect ${TRUE_EFFECT.toFixed(1)}` : `кластерная (чистая): эффект ${TRUE_EFFECT.toFixed(1)}`}</text>
        {/* наивная (сплит по людям) */}
        <rect x={BPAD} y={54} width={bx(naiveEffect) - BPAD} height="22" fill="#2ab8eb" opacity="0.7" rx="2" />
        <text x={BPAD + 4} y={69} fill="#0d7fb0" fontSize="10">{en ? `user split (naive): ${naiveEffect.toFixed(1)}` : `сплит по людям (наивная): ${naiveEffect.toFixed(1)}`}</text>
        {/* истинная отметка */}
        <line x1={bx(TRUE_EFFECT)} y1={16} x2={bx(TRUE_EFFECT)} y2={BH - 26} stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" />
        <text x={BPAD} y={BH - 10} fill="#9a907c" fontSize="10" textAnchor="start">{en ? 'estimated effect of B →' : 'оценённый эффект B →'}</text>
      </svg>
      <div className={`text-sm ${gap > 1.5 ? 'text-[#dc4d4d]' : 'text-green-600'}`}>
        {en ? 'Estimate gap:' : 'Расхождение оценок:'} {gap.toFixed(1)}. {gap > 1.5
          ? (en ? 'The designs diverge noticeably — that is the signal of a SUTVA violation: the effect leaks between groups.' : 'Дизайны заметно расходятся — это и есть сигнал нарушения SUTVA: эффект протекает между группами.')
          : (en ? 'The estimates nearly coincide — almost no interference, SUTVA holds.' : 'Оценки почти совпали — интерференции почти нет, SUTVA выполняется.')}
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'User split: connected people land in different groups, B’s effect "leaks" to their friends in the control (red links), the control rises — and the naive estimate of B’s effect is understated. Cluster randomization (whole communities in one arm) removes almost all cross-group links and gives a clean estimate. A practical way to DETECT interference: estimate the effect both ways — a large gap between them is what gives away the SUTVA violation.'
        : 'Сплит по пользователям: связанные люди попадают в разные группы, эффект B «протекает» к их друзьям из контроля (красные связи), контроль подрастает — и наивная оценка эффекта B занижается. Кластерная рандомизация (целые сообщества в одну ветку) почти убирает межгрупповые связи и даёт чистую оценку. Практический способ ОБНАРУЖИТЬ интерференцию: посчитать эффект обоими способами — большое расхождение между ними и выдаёт нарушение SUTVA.'}</p>
    </div>
  )
}
