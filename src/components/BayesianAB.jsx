import { useMemo, useState } from 'react'

// Байесовский A/B: два апостериорных распределения конверсии (A и B) из данных,
// и прямой ответ P(B > A) — вероятность, что B лучше. Плюс ожидаемые потери.
const W = 560
const H = 230
const PAD = 34
const BASE = H - PAD
const TOP = 20
const G = 200

function gammaln(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]
  let y = x, tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y++; ser += g[j] / y }
  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}
const betaPdf = (x, a, b) => (x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - (gammaln(a) + gammaln(b) - gammaln(a + b))))

export default function BayesianAB({ locale = 'ru' }) {
  const en = locale === 'en'
  const [n, setN] = useState(800)
  const [cA, setCA] = useState(0.10)
  const [cB, setCB] = useState(0.12)

  const aA = 1 + Math.round(cA * n), bA = 1 + n - Math.round(cA * n)
  const aB = 1 + Math.round(cB * n), bB = 1 + n - Math.round(cB * n)

  const { fA, fB, xmin, xmax, yMax, pBwin, eloss } = useMemo(() => {
    const lo = Math.max(0, Math.min(cA, cB) - 0.06)
    const hi = Math.min(1, Math.max(cA, cB) + 0.06)
    const fA = [], fB = []
    let yMax = 0
    for (let i = 0; i <= G; i++) {
      const x = lo + ((hi - lo) * i) / G
      const va = betaPdf(x, aA, bA), vb = betaPdf(x, aB, bB)
      fA.push(va); fB.push(vb); yMax = Math.max(yMax, va, vb)
    }
    // P(B>A) = ∫ fB(x)·FA(x) dx — численно по сетке [0,1]
    const GG = 400; let pBwin = 0
    const cumA = []; let acc = 0
    for (let i = 0; i <= GG; i++) { const x = i / GG; acc += betaPdf(x, aA, bA) / GG; cumA.push(acc) }
    for (let i = 0; i <= GG; i++) { const fb = betaPdf(i / GG, aB, bB) / GG; pBwin += fb * cumA[i] }
    return { fA, fB, xmin: lo, xmax: hi, yMax: yMax * 1.05, pBwin }
  }, [aA, bA, aB, bB, cA, cB])

  const sx = (x) => PAD + ((x - xmin) / (xmax - xmin)) * (W - 2 * PAD)
  const sy = (y) => BASE - (y / yMax) * (BASE - TOP)
  const path = (f) => f.map((y, i) => `${i === 0 ? 'M' : 'L'}${sx(xmin + ((xmax - xmin) * i) / G).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={path(fA)} fill="none" stroke="#9ca3af" strokeWidth="2.5" />
        <path d={path(fB)} fill="none" stroke="#2ab8eb" strokeWidth="2.5" />
        <text x={sx(cA)} y={TOP + 4} fill="#6b7280" fontSize="10" textAnchor="middle">A</text>
        <text x={sx(cB)} y={TOP + 4} fill="#2ab8eb" fontSize="10" textAnchor="middle">B</text>
        <text x={W - PAD} y={BASE + 16} fill="#9a907c" fontSize="10" textAnchor="end">{en ? 'conversion →' : 'конверсия →'}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#9ca3af]">▏ {en ? 'posterior of A' : 'апостериорное A'}</span>
        <span className="text-[#2ab8eb]">▏ {en ? 'posterior of B' : 'апостериорное B'}</span>
        <span className="text-gray-900 font-medium">P(B &gt; A) = {(pBwin * 100).toFixed(1)}%</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Conversion A' : 'Конверсия A'}</span><span className="text-cyanink">{(cA * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.3" step="0.005" value={cA} onChange={(e) => setCA(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Conversion B' : 'Конверсия B'}</span><span className="text-cyanink">{(cB * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.02" max="0.3" step="0.005" value={cB} onChange={(e) => setCB(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'n per group' : 'n на группу'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="100" max="5000" step="100" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'The two distributions are the plausible conversion values of A and B after the data. P(B>A) is the share of cases where a random value from B exceeds one from A. Larger n — both distributions get narrower and the answer more confident. A direct answer to "should we ship B", without a p-value.'
        : 'Два распределения — это правдоподобные значения конверсии A и B после данных. P(B>A) — доля случаев, где случайное значение из B больше, чем из A. Больше n — оба распределения уже, и ответ увереннее. Прямой ответ «стоит ли катить B», без p-value.'}</p>
    </div>
  )
}
