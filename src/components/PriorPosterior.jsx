import { useState } from 'react'

// Байесовское обновление: априорное мнение о доле θ (Beta) + данные (k из n)
// → апостериорное. Видно, как данные «двигают» и заостряют убеждение.
const W = 560
const H = 230
const PAD = 34
const BASE = H - PAD
const TOP = 24
const N = 160

function gammaln(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y++; ser += g[j] / y }
  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}
// Нормированная Beta-плотность через лог-пространство (иначе пиковые a,b дают underflow).
function betaPdf(x, a, b) {
  if (x <= 0 || x >= 1) return 0
  const logB = gammaln(a) + gammaln(b) - gammaln(a + b)
  const logp = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB
  return Math.exp(logp)
}

export default function PriorPosterior({ locale = 'ru' }) {
  const en = locale === 'en'
  const [m, setM] = useState(0.5) // априорное среднее (вера до данных)
  const [s, setS] = useState(8) // сила априори (сколько «виртуальных» наблюдений)
  const [k, setK] = useState(34) // успехи в данных
  const [n, setN] = useState(50) // всего наблюдений

  const a0 = Math.max(0.5, m * s)
  const b0 = Math.max(0.5, (1 - m) * s)
  const a1 = a0 + k
  const b1 = b0 + (n - k)
  const priorMean = a0 / (a0 + b0)
  const postMean = a1 / (a1 + b1)

  // Правдоподобие данных как функция θ ∝ θ^k (1−θ)^(n−k) — это форма Beta(k+1, n−k+1).
  const dataProp = n > 0 ? k / n : 0.5
  const sx = (x) => PAD + x * (W - 2 * PAD)
  const pts = []
  let yMax = 0
  for (let i = 0; i <= N; i++) {
    const x = i / N
    const pr = betaPdf(x, a0, b0)
    const lk = n > 0 ? betaPdf(x, k + 1, n - k + 1) : 0
    const po = betaPdf(x, a1, b1)
    pts.push({ x, pr, lk, po })
    yMax = Math.max(yMax, pr, lk, po)
  }
  yMax *= 1.05 || 1
  const sy = (y) => BASE - (y / yMax) * (BASE - TOP)
  const line = (key) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p[key]).toFixed(1)}`).join(' ')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={`${line('pr')}`} fill="none" stroke="#9ca3af" strokeWidth="2" />
        <path d={`${line('lk')}`} fill="none" stroke="#d99a06" strokeWidth="2" strokeDasharray="5 3" />
        <path d={`${line('po')}`} fill="none" stroke="#2ab8eb" strokeWidth="2.5" />
        <line x1={sx(priorMean)} y1={TOP} x2={sx(priorMean)} y2={BASE} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={sx(postMean)} y1={TOP} x2={sx(postMean)} y2={BASE} stroke="#2ab8eb" strokeWidth="1" strokeDasharray="3 3" />
        <text x={sx(priorMean)} y={TOP - 2} fill="#9ca3af" fontSize="11" textAnchor="middle">{en ? 'prior' : 'априори'} {priorMean.toFixed(2)}</text>
        <text x={sx(postMean)} y={TOP + 9} fill="#0d7fb0" fontSize="11" textAnchor="middle">{en ? 'result' : 'итог'} {postMean.toFixed(2)}</text>
        <text x={sx(0)} y={BASE + 16} fill="#9a907c" fontSize="12">0</text>
        <text x={sx(1)} y={BASE + 16} fill="#9a907c" fontSize="12" textAnchor="end">{en ? '1 · θ (true share/conversion)' : '1 · θ (истинная доля/конверсия)'}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
        <span className="text-[#9ca3af]">▏ {en ? 'prior (belief before the data), center' : 'априори (мнение до данных), центр'} {priorMean.toFixed(2)}</span>
        <span className="text-[#d99a06]">▏ {en ? `likelihood (the data alone ${k}/${n} = ${dataProp.toFixed(2)})` : `правдоподобие (только данные ${k}/${n} = ${dataProp.toFixed(2)})`}</span>
        <span className="text-[#2ab8eb]">▏ {en ? 'posterior (the result), center' : 'апостериори (итог), центр'} {postMean.toFixed(2)}</span>
      </div>

      <div className="mt-2 rounded-lg border border-black/10 bg-ink px-3 py-2 text-xs font-mono text-gray-700">
        {en
          ? <>posterior(θ) ∝ prior(θ) × likelihood(data | θ){'  →  '}the result’s center {postMean.toFixed(2)} lies between {priorMean.toFixed(2)} (prior) and {dataProp.toFixed(2)} (data)</>
          : <>апостериори(θ) ∝ априори(θ) × правдоподобие(данные | θ){'  →  '}центр итога {postMean.toFixed(2)} лежит между {priorMean.toFixed(2)} (априори) и {dataProp.toFixed(2)} (данные)</>}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Prior belief (mean θ)' : 'Априорное мнение (среднее θ)'}</span><span className="text-cyanink">{m.toFixed(2)}</span></div>
          <input type="range" min="0.05" max="0.95" step="0.05" value={m} onChange={(e) => setM(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Prior strength (confidence)' : 'Сила априори (уверенность)'}</span><span className="text-cyanink">{s}</span></div>
          <input type="range" min="2" max="60" step="1" value={s} onChange={(e) => setS(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Data: successes k' : 'Данные: успехов k'}</span><span className="text-cyanink">{k}</span></div>
          <input type="range" min="0" max={n} step="1" value={k} onChange={(e) => setK(Math.min(n, Number(e.target.value)))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Data: total n' : 'Данные: всего n'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="0" max="400" step="5" value={n} onChange={(e) => { const v = Number(e.target.value); setN(v); if (k > v) setK(v) }} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'θ is the unknown true share (say, a button’s conversion). The gray curve is what you believe BEFORE the data (the prior); its center is set by "Prior belief" and its width by "Prior strength" (more strength → narrower and more confident). The yellow dashed one is what the data ALONE says (k successes out of n): its peak sits at the share k/n. The blue one is the result (the posterior): it comes from multiplying the gray and the yellow and always lies BETWEEN them. Move the sliders: with little data the result leans toward the prior; at large n the yellow curve gets narrow and pulls the result toward itself — the data "overrides" the initial belief.'
        : 'θ — это неизвестная истинная доля (например, конверсия кнопки). Серая кривая — во что вы верите ДО данных (априори); её центр задаёт «Априорное мнение», а ширину — «Сила априори» (больше сила → уже и увереннее). Жёлтая пунктирная — что говорят ОДНИ данные (k успехов из n): её пик стоит на доле k/n. Синяя — итог (апостериори): он получается перемножением серой и жёлтой и всегда лежит МЕЖДУ ними. Двигайте ползунки: при малых данных итог тянется к априори, при больших n жёлтая кривая становится узкой и перетягивает итог на себя — данные «перебивают» исходное мнение.'}</p>
    </div>
  )
}
