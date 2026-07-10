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
  t: { df: 10, tcrit: 2.23, main: (x) => tpdf(x, 10), note: 'Статистику t сверяют с распределением Стьюдента. На малых выборках оно ШИРЕ нормального (тяжёлые хвосты, пунктир) — поэтому порог значимости чуть дальше от нуля. С ростом n t сходится к нормальному.', noteEn: 'The t statistic is checked against Student\u2019s distribution. On small samples it is WIDER than normal (heavy tails, the dashed line) — so the significance threshold sits slightly farther from zero. As n grows, t converges to normal.' },
  z: { df: null, tcrit: 1.96, main: npdf, note: 'Статистику z сверяют со стандартным нормальным N(0,1). Порог двустороннего теста при α=5% — ±1.96: если |z| заходит в закрашенные хвосты, H0 отвергают.', noteEn: 'The z statistic is checked against the standard normal N(0,1). The two-sided threshold at α=5% is ±1.96: if |z| enters the shaded tails, H0 is rejected.' },
  u: { df: null, tcrit: 1.96, main: npdf, note: 'Статистику U (сумма рангов) под H0 при не слишком малых группах аппроксимируют нормальным. Важно: она строится на МЕСТАХ наблюдений, а не на их величинах, — поэтому не отвечает на вопрос о разнице средних.', noteEn: 'Under H0, with groups not too small, the U statistic (a rank sum) is approximated by the normal. Important: it is built on the PLACES of observations, not their sizes — so it does not answer the question about a difference of means.' },
}

const METRICS = {
  means: { label: 'Средние (нормальные)', labelEn: 'Means (normal)', hint: 'непрерывная метрика, симметричный разброс — например, время на сайте', hintEn: 'a continuous metric with symmetric spread — e.g. time on site' },
  conversion: { label: 'Доля / конверсия', labelEn: 'Share / conversion', hint: 'бинарная метрика «купил / не купил»', hintEn: 'a binary bought / did-not metric' },
  skew: { label: 'Скошенная с выбросами', labelEn: 'Skewed with outliers', hint: 'тяжёлый правый хвост — выручка, длительности', hintEn: 'a heavy right tail — revenue, durations' },
}
const CRITERIA = { t: 't-тест', z: 'z-тест (доли)', u: 'Манна–Уитни' }
const CRITERIA_EN = { t: 't-test', z: 'z-test (shares)', u: 'Mann–Whitney' }
const CORRECT = { means: 't', conversion: 'z', skew: 't' }
// Краткий механизм каждого критерия — показываем при выборе (учит отличию).
const MECH = {
  t: 'Механизм: берёт разницу средних и делит на стандартную ошибку — t = (x̄A − x̄B) / SE. Работает со значениями, отвечает на вопрос о разнице СРЕДНИХ.', tEn: 'Mechanism: takes the difference of means and divides by the standard error — t = (x̄A − x̄B) / SE. Works with values; answers the question about a difference of MEANS.',
  z: 'Механизм: берёт разницу долей и делит на её стандартную ошибку — z = (p̂A − p̂B) / SE. Работает с долями «да/нет».', zEn: 'Mechanism: takes the difference of shares and divides by its standard error — z = (p̂A − p̂B) / SE. Works with yes/no shares.',
  u: 'Механизм: ранжирует все наблюдения вместе и сравнивает их МЕСТА (статистика U ≈ P(A>B)). Отвечает на вопрос «у кого чаще больше», т.е. сравнивает РАСПРЕДЕЛЕНИЯ, а не средние.', uEn: 'Mechanism: ranks all observations together and compares their PLACES (the U statistic ≈ P(A>B)). Answers "who tends to be larger", i.e. compares DISTRIBUTIONS, not means.',
}

const FEEDBACK = {
  means: {
    t: ['ok', 'Верно. Метрика — среднее с симметричным разбросом, и t-тест сравнивает средние: t = (x̄A − x̄B) / SE.', 'Correct. The metric is a mean with symmetric spread, and the t-test compares means: t = (x̄A − x̄B) / SE.'],
    z: ['bad', 'z-тест — для долей/конверсии, а здесь непрерывная метрика-среднее. Нужен t-тест.', 'The z-test is for shares/conversion, but this is a continuous mean metric. You need the t-test.'],
    u: ['meh', 'Манна–Уитни сработает, но на нормальных данных он менее мощный, чем t-тест, — теряете чувствительность. Для средних берите t.', 'Mann–Whitney will work, but on normal data it is less powerful than the t-test — you lose sensitivity. For means take t.'],
  },
  conversion: {
    z: ['ok', 'Верно. Метрика — доля (купил/не купил). z-тест для долей сравнивает p̂A и p̂B — основной критерий A/B по конверсии.', 'Correct. The metric is a share (bought / did not). The z-test for shares compares p̂A and p̂B — the main A/B test for conversion.'],
    t: ['meh', 'Для долей обычно берут z-тест (или χ²). t-тест про средние; на больших n он близок, но это не его задача.', 'For shares one usually takes the z-test (or χ²). The t-test is about means; at large n it comes close, but it is not its job.'],
    u: ['bad', 'Манна–Уитни — для порядковых/скошенных непрерывных метрик, а не для «да/нет». Здесь нужен z-тест.', 'Mann–Whitney is for ordinal/skewed continuous metrics, not yes/no. Here you need the z-test.'],
  },
  skew: {
    t: ['ok', 't-тест сравнивает средние — обычно именно это важно бизнесу (выручка, время). Но на СЫРЫХ скошенных данных его тащит выброс. Правильный путь — не менять вопрос, а обработать хвост (см. ниже) и применить t к среднему.', 'The t-test compares means — usually what the business cares about (revenue, time). But on RAW skewed data an outlier drags it. The right path is not to change the question but to treat the tail (below) and apply t to the mean.'],
    u: ['meh', 'Манна–Уитни устойчив к выбросу, НО сравнивает распределения (у кого чаще больше), а не средние. Берите его, только если вам действительно важен сдвиг распределения. Если важно среднее — обработайте выбросы и возьмите t.', 'Mann–Whitney shrugs off the outlier BUT compares distributions (who tends to be larger), not means. Take it only if the distribution shift truly matters. If the mean matters — treat the outliers and take t.'],
    z: ['bad', 'z-тест — для долей, а тут непрерывная скошенная метрика.', 'The z-test is for shares, but this is a continuous skewed metric.'],
  },
}

export default function CriterionPicker({ locale = 'ru' }) {
  const en = locale === 'en'
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
      <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Step 1 · what kind of metric?' : 'Шаг 1 · что за метрика?'}</div>
      <div className="flex flex-wrap gap-2 mb-1">
        {Object.entries(METRICS).map(([k, m]) => (
          <button key={k} onClick={() => { setMetric(k); setCrit(null) }} className={`text-xs px-2.5 py-1 rounded-md border ${metric === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? (m.labelEn ?? m.label) : m.label}</button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-3">{en ? (METRICS[metric].hintEn ?? METRICS[metric].hint) : METRICS[metric].hint}</p>

      {/* распределение метрики */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {data.type === 'bars' ? <Bars pA={data.pA} pB={data.pB} en={en} /> : <Dots A={data.A} B={data.B} en={en} />}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 mb-3">
        <span className="text-gray-500"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle bg-[#9ca3af]" /> {en ? 'group A' : 'группа A'}</span>
        <span className="text-cyanink"><span className="inline-block w-2.5 h-2.5 rounded-full align-middle bg-[#2ab8eb]" /> {en ? 'group B' : 'группа B'}</span>
      </div>

      {/* Шаг 2 */}
      <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Step 2 · which test do you apply?' : 'Шаг 2 · какой критерий примените?'}</div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(en ? CRITERIA_EN : CRITERIA).map(([k, label]) => (
          <button key={k} onClick={() => setCrit(k)} className={`text-xs px-2.5 py-1 rounded-md border ${crit === k ? 'border-accent/60 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{label}</button>
        ))}
      </div>

      {fb && (
        <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${fb[0] === 'ok' ? 'border-green-500/40 bg-green-500/5 text-gray-700' : fb[0] === 'meh' ? 'border-amber-400/40 bg-amber-400/[0.07] text-gray-700' : 'border-red-400/40 bg-red-400/[0.06] text-gray-700'}`}>
          <span className={fb[0] === 'ok' ? 'text-green-600 font-medium' : fb[0] === 'meh' ? 'text-amber-600 font-medium' : 'text-[#dc4d4d] font-medium'}>
            {fb[0] === 'ok' ? '✓ ' : fb[0] === 'meh' ? '~ ' : '✗ '}
          </span>
          {en ? (fb[2] ?? fb[1]) : fb[1]}
          {fb[0] !== 'ok' && <span className="text-gray-500"> {en ? 'Better here:' : 'Здесь лучше:'} <span className="text-cyanink">{(en ? CRITERIA_EN : CRITERIA)[CORRECT[metric]]}</span>.</span>}
        </div>
      )}
      {crit && (
        <div className="mt-3">
          <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Reference distribution of the statistic' : 'Эталонное распределение статистики'}</div>
          <svg viewBox={`0 0 ${W} 140`} className="w-full h-auto select-none">
            <RefDist crit={crit} />
          </svg>
          <p className="text-xs text-gray-500 mt-1">{en ? (REF[crit].noteEn ?? REF[crit].note) : REF[crit].note}</p>
          <p className="text-xs text-gray-500 mt-1">{en ? (MECH[crit + 'En'] ?? MECH[crit]) : MECH[crit]}</p>
        </div>
      )}

      {metric === 'skew' && (
        <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-3 py-2 text-sm text-gray-700">
          <div className="text-xs uppercase tracking-wider text-amber-600 mb-1">{en ? 'What to do with outliers (important)' : 'Что делать с выбросами (важно)'}</div>
          {en ? 'Mann–Whitney tempts with its "robustness", but it answers a different question — it compares distributions, not means. If the business cares about the mean, treat the tail instead of changing the method:' : 'Манна–Уитни соблазнителен «устойчивостью», но он отвечает на другой вопрос — сравнивает распределения, а не средние. Если бизнесу важно среднее, лучше не менять метод, а обработать хвост:'}
          <ul className="mt-1 ml-4 list-disc space-y-0.5 text-gray-600">
            <li><b>{en ? 'Winsorizing (capping):' : 'Винзоризация (кэпинг):'}</b> {en ? 'clip extreme values to a threshold (e.g. p1/p99) while keeping the observation in the data.' : 'обрезать экстремальные значения до порога (напр. p1/p99), оставив наблюдение в данных.'}</li>
            <li><b>{en ? 'Log transform:' : 'Логарифмирование:'}</b> {en ? 'log(x) compresses the right tail — the distribution nears symmetry, and t on the log-mean is valid again.' : 'log(x) сжимает правый хвост — распределение становится ближе к симметричному, и t к среднему log снова валиден.'}</li>
            <li><b>{en ? 'Dropping clear errors:' : 'Удаление явных ошибок:'}</b> {en ? 'impossible values (typos, bots) are removed deliberately and the decision is recorded.' : 'нереальные значения (ввод, боты) убирают осознанно и фиксируют решение.'}</li>
          </ul>
          {en ? 'After the treatment, apply the t-test to the mean. Mann–Whitney is the fallback when the distribution shift itself matters.' : 'После обработки применяют t-тест к среднему. Манна–Уитни — запасной вариант, когда важен именно сдвиг распределения.'}
        </div>
      )}
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en ? 'First pick the metric type — you will see what its data looks like in two groups. Then pick a test: the widget shows its reference (null) distribution and tells you whether it fits and why. The test is matched to the metric BEFORE the experiment.' : 'Сначала выберите тип метрики — увидите, как выглядят её данные у двух групп. Затем выберите критерий: виджет покажет его эталонное (нулевое) распределение, скажет, подходит ли он и почему. Критерий подбирают под метрику ДО эксперимента.'}</p>
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
        ? <text x={W - PAD} y={top + 2} fill="#6b7280" fontSize="10" textAnchor="end"><tspan fill="#2ab8eb">t (ν={ref.df})</tspan> · <tspan fill="#9ca3af">{en ? 'normal' : 'норм.'}</tspan></text>
        : <text x={W - PAD} y={top + 2} fill="#6b7280" fontSize="10" textAnchor="end">{crit === 'z' ? 'N(0,1)' : (en ? 'U ≈ normal' : 'U ≈ норм.')}</text>}
    </g>
  )
}

function Dots({ A, B, en }) {
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
      <text x={W - PAD} y={H - 8} fill="#9a907c" fontSize="10" textAnchor="end">{en ? 'metric value → (ticks are group means)' : 'значение метрики → (палочки — средние групп)'}</text>
    </g>
  )
}

function Bars({ pA, pB, en }) {
  const xmax = 0.2
  const sx = (p) => PAD + (p / xmax) * (W - 2 * PAD)
  const Bar = (p, y, color, label) => (
    <g>
      <text x={PAD - 6} y={y + 16} fill="#374151" fontSize="11" textAnchor="end">{label}</text>
      <rect x={PAD} y={y} width={W - 2 * PAD} height="24" fill="#ece6d8" rx="3" />
      <rect x={PAD} y={y} width={sx(p) - PAD} height="24" fill={color} rx="3" />
      <text x={sx(p) + 6} y={y + 16} fill={color} fontSize="11">{(p * 100).toFixed(0)}%{en ? ' bought' : ' купили'}</text>
    </g>
  )
  return (
    <g>
      {Bar(pA, 56, '#9ca3af', 'A')}
      {Bar(pB, 110, '#2ab8eb', 'B')}
      <text x={PAD} y={H - 10} fill="#9a907c" fontSize="10" textAnchor="start">{en ? 'share who bought (conversion) — a yes/no metric' : 'доля купивших (конверсия) — метрика «да / нет»'}</text>
    </g>
  )
}
