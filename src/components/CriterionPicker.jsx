import { useMemo, useState } from 'react'

// Интерактив про САМ выбор критерия. Шаг 1: выбрать тип метрики → рисуется её
// распределение (две группы A/B). Шаг 2: выбрать критерий (t / z / Манна–Уитни)
// → обратная связь «верно / почему». Заменяет нерелевантный t-график.
const W = 520
const H = 200
const PAD = 40

const rnd = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x) }
const randn = (i) => Math.sqrt(-2 * Math.log(rnd(2 * i + 1) || 1e-9)) * Math.cos(2 * Math.PI * rnd(2 * i + 2))

// --- эталонные (нулевые) распределения статистик критериев ---
const npdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
// гамма-функция (Lanczos) для плотности Стьюдента
const G = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  z -= 1
  let x = 0.99999999999980993
  for (let i = 0; i < G.length; i++) x += G[i] / (z + i + 1)
  const t = z + G.length - 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}
// плотность Стьюдента с ν степенями свободы
const tpdf = (x, nu) => (gamma((nu + 1) / 2) / (Math.sqrt(nu * Math.PI) * gamma(nu / 2))) * Math.pow(1 + (x * x) / nu, -(nu + 1) / 2)

// эталонное распределение под выбранный критерий: что рисуем и где хвосты отсечения
const REF = {
  t: { df: 10, tcrit: 2.23, main: (x) => tpdf(x, 10), note: 'Статистику t сверяют с распределением Стьюдента. На малых выборках оно ШИРЕ нормального (тяжёлые хвосты, пунктир) — поэтому порог значимости чуть дальше от нуля. С ростом n t сходится к нормальному.' },
  z: { df: null, tcrit: 1.96, main: npdf, note: 'Статистику z сверяют со стандартным нормальным N(0,1). Порог двустороннего теста при α=5% — ±1.96: если |z| заходит в закрашенные хвосты, H0 отвергают.' },
  u: { df: null, tcrit: 1.96, main: npdf, note: 'Статистику U (сумма рангов) под H0 при не слишком малых группах аппроксимируют нормальным. Важно: она строится на МЕСТАХ наблюдений, а не на их величинах, — поэтому не отвечает на вопрос о разнице средних.' },
}

const METRICS = {
  means: { label: 'Средние (нормальные)', hint: 'непрерывная метрика, симметричный разброс — например, время на сайте' },
  conversion: { label: 'Доля / конверсия', hint: 'бинарная метрика «купил / не купил»' },
  skew: { label: 'Скошенная с выбросами', hint: 'тяжёлый правый хвост — выручка, длительности' },
}
const CRITERIA = { t: 't-тест', z: 'z-тест (доли)', u: 'Манна–Уитни' }
const CORRECT = { means: 't', conversion: 'z', skew: 't' }
// Краткий механизм каждого критерия — показываем при выборе (учит отличию).
const MECH = {
  t: 'Механизм: берёт разницу средних и делит на стандартную ошибку — t = (x̄A − x̄B) / SE. Работает со значениями, отвечает на вопрос о разнице СРЕДНИХ.',
  z: 'Механизм: берёт разницу долей и делит на её стандартную ошибку — z = (p̂A − p̂B) / SE. Работает с долями «да/нет».',
  u: 'Механизм: ранжирует все наблюдения вместе и сравнивает их МЕСТА (статистика U ≈ P(A>B)). Отвечает на вопрос «у кого чаще больше», т.е. сравнивает РАСПРЕДЕЛЕНИЯ, а не средние.',
}

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
    t: ['ok', 't-тест сравнивает средние — обычно именно это важно бизнесу (выручка, время). Но на СЫРЫХ скошенных данных его тащит выброс. Правильный путь — не менять вопрос, а обработать хвост (см. ниже) и применить t к среднему.'],
    u: ['meh', 'Манна–Уитни устойчив к выбросу, НО сравнивает распределения (у кого чаще больше), а не средние. Берите его, только если вам действительно важен сдвиг распределения. Если важно среднее — обработайте выбросы и возьмите t.'],
    z: ['bad', 'z-тест — для долей, а тут непрерывная скошенная метрика.'],
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
      {crit && (
        <div className="mt-3">
          <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">Эталонное распределение статистики</div>
          <svg viewBox={`0 0 ${W} 140`} className="w-full h-auto select-none">
            <RefDist crit={crit} />
          </svg>
          <p className="text-xs text-gray-500 mt-1">{REF[crit].note}</p>
          <p className="text-xs text-gray-500 mt-1">{MECH[crit]}</p>
        </div>
      )}

      {metric === 'skew' && (
        <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-3 py-2 text-sm text-gray-700">
          <div className="text-xs uppercase tracking-wider text-amber-600 mb-1">Что делать с выбросами (важно)</div>
          Манна–Уитни соблазнителен «устойчивостью», но он отвечает на другой вопрос — сравнивает распределения, а не средние. Если бизнесу важно среднее, лучше не менять метод, а обработать хвост:
          <ul className="mt-1 ml-4 list-disc space-y-0.5 text-gray-600">
            <li><b>Винзоризация (кэпинг):</b> обрезать экстремальные значения до порога (напр. p1/p99), оставив наблюдение в данных.</li>
            <li><b>Логарифмирование:</b> log(x) сжимает правый хвост — распределение становится ближе к симметричному, и t к среднему log снова валиден.</li>
            <li><b>Удаление явных ошибок:</b> нереальные значения (ввод, боты) убирают осознанно и фиксируют решение.</li>
          </ul>
          После обработки применяют t-тест к среднему. Манна–Уитни — запасной вариант, когда важен именно сдвиг распределения.
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2">Сначала выберите тип метрики — увидите, как выглядят её данные у двух групп. Затем выберите критерий: виджет покажет его эталонное (нулевое) распределение, скажет, подходит ли он и почему. Критерий подбирают под метрику ДО эксперимента.</p>
    </div>
  )
}

// Эталонное (нулевое) распределение статистики выбранного критерия с хвостами
// отсечения при α=5% (двусторонний). Для t — поверх нормального (пунктир),
// чтобы видеть тяжёлые хвосты.
function RefDist({ crit }) {
  const ref = REF[crit]
  const RH = 140
  const base = RH - 26
  const top = 16
  const xlo = -4, xhi = 4
  const sx = (x) => PAD + ((x - xlo) / (xhi - xlo)) * (W - 2 * PAD)
  const ymax = crit === 't' ? tpdf(0, ref.df) : npdf(0)
  const sy = (y) => base - (y / ymax) * (base - top)
  const path = (fn) => {
    let d = ''
    for (let i = 0; i <= 160; i++) { const x = xlo + (i / 160) * (xhi - xlo); d += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)} ` }
    return d
  }
  const tail = (fn, from, to) => {
    let d = `M${sx(from).toFixed(1)},${base} `
    for (let i = 0; i <= 40; i++) { const x = from + (i / 40) * (to - from); d += `L${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)} ` }
    d += `L${sx(to).toFixed(1)},${base} Z`
    return d
  }
  const c = ref.tcrit
  return (
    <g>
      {/* хвосты отсечения */}
      <path d={tail(ref.main, c, xhi)} fill="#f87171" opacity="0.28" />
      <path d={tail(ref.main, xlo, -c)} fill="#f87171" opacity="0.28" />
      <line x1={PAD} y1={base} x2={W - PAD} y2={base} stroke="#d6cebf" strokeWidth="1.5" />
      {/* нормальное для сравнения (только у t) */}
      {crit === 't' && <path d={path(npdf)} fill="none" stroke="#9ca3af" strokeWidth="1.4" strokeDasharray="4 3" />}
      <path d={path(ref.main)} fill="none" stroke="#2ab8eb" strokeWidth="2.2" />
      {/* пороги */}
      {[c, -c].map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={top} x2={sx(v)} y2={base} stroke="#2a2f3a" strokeWidth="1" strokeDasharray="3 3" />
          <text x={sx(v)} y={base + 14} fill="#2a2f3a" fontSize="10" textAnchor="middle">{v > 0 ? '+' : ''}{v.toFixed(2)}</text>
        </g>
      ))}
      <text x={sx(0)} y={base + 14} fill="#9ca3af" fontSize="10" textAnchor="middle">0</text>
      {crit === 't'
        ? <text x={W - PAD} y={top + 2} fill="#6b7280" fontSize="10" textAnchor="end"><tspan fill="#2ab8eb">t (ν={ref.df})</tspan> · <tspan fill="#9ca3af">норм.</tspan></text>
        : <text x={W - PAD} y={top + 2} fill="#6b7280" fontSize="10" textAnchor="end">{crit === 'z' ? 'N(0,1)' : 'U ≈ норм.'}</text>}
    </g>
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
