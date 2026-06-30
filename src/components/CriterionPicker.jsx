import { useMemo, useState } from 'react'

// Интерактив про САМ выбор критерия. Шаг 1: выбрать тип метрики → рисуется её
// распределение (две группы A/B). Шаг 2: выбрать критерий (t / z / Манна–Уитни)
// → обратная связь «верно / почему». Заменяет нерелевантный t-график.
const W = 520
const H = 200
const PAD = 40

const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x) }
const randn = (i) => Math.sqrt(-2 * Math.log(rnd(2 * i + 1) || 1e-9)) * Math.cos(2 * Math.PI * rnd(2 * i + 2))

const METRICS = {
  means: { label: 'Средние (нормальные)', hint: 'непрерывная метрика, симметричный разброс — например, время на сайте' },
  conversion: { label: 'Доля / конверсия', hint: 'бинарная метрика «купил / не купил»' },
  skew: { label: 'Скошенная с выбросами', hint: 'тяжёлый правый хвост — выручка, длительности' },
}
const CRITERIA = { t: 't-тест', z: 'z-тест (доли)', u: 'Манна–Уитни' }
const CORRECT = { means: 't', conversion: 'z', skew: 'u' }

const FEEDBACK = {
  means: {
    t: ['ok', 'Верно. Метрика — среднее с симметричным разбросом, и t-тест сравнивает средние: t = (x̄A − x̄B) / SE.'],
    z: ['bad', 'z-тест — для долей/конверсии, а здесь непрерывная метрика-среднее. Нужен t-тест.'],
    u: ['meh', 'Манна–Уитни сработает, но на нормальных данных он менее мощный, чем t-тест, — теряете чувствительность. Для средних берите t.'],
  },
  conversion: {
    z: ['ok', 'Верно. Метрика — доля (купил/не купил). z-тест для долей сравнивает p̂A и p̂B — основной критерий A/B по конверсии.'],
    t: ['meh', 'Для долей обычно берут z-тест (или χ²). t-тест про средние; на больших n он близок, но это не его задача.'],
    u: ['bad', 'Манна–Уитни — для порядковых/скошенных непрерывных метрик, а не для «да/нет». Здесь нужен z-тест.'],
  },
  skew: {
    u: ['ok', 'Верно. Данные скошены и есть выброс — ранговый Манна–Уитни устойчив к нему: он работает с местами (рангами), а не со значениями.'],
    t: ['bad', 't-тест опирается на среднее, а его тащит выброс — вывод шаткий. На скошенных данных с выбросами берите Манна–Уитни (или бутстреп).'],
    z: ['bad', 'z-тест — для долей, а тут непрерывная скошенная метрика. Возьмите Манна–Уитни.'],
  },
}

export default function CriterionPicker() {
  const [metric, setMetric] = useState('means')
  const [crit, setCrit] = useState(null)

  // данные двух групп под выбранную метрику (детерминированно)
  const data = useMemo(() => {
    if (metric === 'conversion') return { type: 'bars', pA: 0.10, pB: 0.13 }
    const n = 28
    const A = [], B = []
    for (let i = 0; i < n; i++) {
      if (metric === 'means') { A.push(50 + randn(i) * 8); B.push(56 + randn(i + 50) * 8) }
      else { A.push(8 + Math.abs(randn(i + 7)) * 10 + (-Math.log(rnd(i + 3) || 1e-9)) * 6); B.push(10 + Math.abs(randn(i + 90)) * 11 + (-Math.log(rnd(i + 60) || 1e-9)) * 7) }
    }
    if (metric === 'skew') { A[0] = 115; B[0] = 105 } // выбросы
    return { type: 'dots', A, B }
  }, [metric])

  const fb = crit ? FEEDBACK[metric][crit] : null

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {/* Шаг 1 */}
      <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">Шаг 1 · что за метрика?</div>
      <div className="flex flex-wrap gap-2 mb-1">
        {Object.entries(METRICS).map(([k, m]) => (
          <button key={k} onClick={() => { setMetric(k); setCrit(null) }} className={`text-xs px-2.5 py-1 rounded border ${metric === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{m.label}</button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-3">{METRICS[metric].hint}</p>

      {/* распределение метрики */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {data.type === 'bars' ? <Bars pA={data.pA} pB={data.pB} /> : <Dots A={data.A} B={data.B} />}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 mb-3">
        <span className="text-gray-500"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle bg-[#9ca3af]" /> группа A</span>
        <span className="text-cyanink"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle bg-[#2ab8eb]" /> группа B</span>
      </div>

      {/* Шаг 2 */}
      <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">Шаг 2 · какой критерий примените?</div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(CRITERIA).map(([k, label]) => (
          <button key={k} onClick={() => setCrit(k)} className={`text-xs px-2.5 py-1 rounded border ${crit === k ? 'border-accent/60 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{label}</button>
        ))}
      </div>

      {fb && (
        <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${fb[0] === 'ok' ? 'border-green-500/40 bg-green-500/5 text-gray-700' : fb[0] === 'meh' ? 'border-amber-400/40 bg-amber-400/[0.07] text-gray-700' : 'border-red-400/40 bg-red-400/[0.06] text-gray-700'}`}>
          <span className={fb[0] === 'ok' ? 'text-green-600 font-medium' : fb[0] === 'meh' ? 'text-amber-600 font-medium' : 'text-[#dc4d4d] font-medium'}>
            {fb[0] === 'ok' ? '✓ ' : fb[0] === 'meh' ? '~ ' : '✗ '}
          </span>
          {fb[1]}
          {fb[0] !== 'ok' && <span className="text-gray-500"> Здесь лучше: <span className="text-cyanink">{CRITERIA[CORRECT[metric]]}</span>.</span>}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">Сначала выберите тип метрики — увидите, как выглядят её данные у двух групп. Затем выберите критерий: виджет скажет, подходит ли он и почему. Критерий подбирают под метрику ДО эксперимента.</p>
    </div>
  )
}

function Dots({ A, B }) {
  const all = [...A, ...B]
  const lo = Math.min(...all), hi = Math.max(...all)
  const sx = (x) => PAD + ((x - lo) / (hi - lo || 1)) * (W - 2 * PAD)
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length
  const mA = mean(A), mB = mean(B)
  const rowA = 78, rowB = 138
  return (
    <g>
      <line x1={PAD} y1={rowA + 28} x2={W - PAD} y2={rowA + 28} stroke="#d6cebf" strokeWidth="1" />
      <text x={PAD} y={40} fill="#6b7280" fontSize="10" textAnchor="start">A</text>
      <text x={PAD} y={rowB - 8} fill="#0d7fb0" fontSize="10" textAnchor="start">B</text>
      {A.map((v, i) => <circle key={`a${i}`} cx={sx(v)} cy={rowA + (i % 3) * 6 - 6} r="3.4" fill="#9ca3af" opacity="0.65" />)}
      {B.map((v, i) => <circle key={`b${i}`} cx={sx(v)} cy={rowB + (i % 3) * 6 - 6} r="3.4" fill="#2ab8eb" opacity="0.6" />)}
      <line x1={sx(mA)} y1={rowA - 14} x2={sx(mA)} y2={rowA + 16} stroke="#6b7280" strokeWidth="2" />
      <line x1={sx(mB)} y1={rowB - 14} x2={sx(mB)} y2={rowB + 16} stroke="#2ab8eb" strokeWidth="2" />
      <text x={W - PAD} y={H - 8} fill="#9a907c" fontSize="10" textAnchor="end">значение метрики → (палочки — средние групп)</text>
    </g>
  )
}

function Bars({ pA, pB }) {
  const xmax = 0.2
  const sx = (p) => PAD + (p / xmax) * (W - 2 * PAD)
  const Bar = (p, y, color, label) => (
    <g>
      <text x={PAD - 6} y={y + 16} fill="#374151" fontSize="11" textAnchor="end">{label}</text>
      <rect x={PAD} y={y} width={W - 2 * PAD} height="24" fill="#ece6d8" rx="3" />
      <rect x={PAD} y={y} width={sx(p) - PAD} height="24" fill={color} rx="3" />
      <text x={sx(p) + 6} y={y + 16} fill={color} fontSize="11">{(p * 100).toFixed(0)}% купили</text>
    </g>
  )
  return (
    <g>
      {Bar(pA, 56, '#9ca3af', 'A')}
      {Bar(pB, 110, '#2ab8eb', 'B')}
      <text x={PAD} y={H - 10} fill="#9a907c" fontSize="10" textAnchor="start">доля купивших (конверсия) — метрика «да / нет»</text>
    </g>
  )
}
