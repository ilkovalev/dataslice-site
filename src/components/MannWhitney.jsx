import { useMemo, useState } from 'react'

// Критерий Манна–Уитни: непараметрический тест на различие двух групп.
// Работает с РАНГАМИ, а не значениями, поэтому устойчив к выбросам и не требует
// нормальности. Интуиция — «вероятность превосходства» P(A > B).
const W = 560
const H = 170
const PAD = 36
const ROW_A = 60
const ROW_B = 110
const DOM = 100

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

const BASE_A = [22, 28, 33, 38, 41, 45, 50, 56, 62, 70]
const BASE_B = [18, 24, 30, 35, 40, 44, 49, 54, 60, 68]

export default function MannWhitney() {
  const [shift, setShift] = useState(14)
  const [outlier, setOutlier] = useState(false)

  const A = useMemo(() => {
    const arr = BASE_A.map((v) => v + shift)
    return outlier ? [...arr, 99] : arr
  }, [shift, outlier])
  const B = BASE_B

  const { U, ps, z, p } = useMemo(() => {
    let U = 0
    for (const a of A) for (const b of B) U += a > b ? 1 : a === b ? 0.5 : 0
    const m = A.length, nn = B.length
    const ps = U / (m * nn)
    const muU = (m * nn) / 2
    const sigU = Math.sqrt((m * nn * (m + nn + 1)) / 12)
    const z = (U - muU) / sigU
    const p = 2 * (1 - Phi(Math.abs(z)))
    return { U, ps, z, p }
  }, [A, B])

  const sx = (x) => PAD + (Math.min(DOM, Math.max(0, x)) / DOM) * (W - 2 * PAD)
  const sig = p < 0.05

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={ROW_A} x2={W - PAD} y2={ROW_A} stroke="#e7e1d4" strokeWidth="1" />
        <line x1={PAD} y1={ROW_B} x2={W - PAD} y2={ROW_B} stroke="#e7e1d4" strokeWidth="1" />
        <text x={8} y={ROW_A + 4} fill="#2ab8eb" fontSize="11">A</text>
        <text x={8} y={ROW_B + 4} fill="#6b7280" fontSize="11">B</text>
        {A.map((v, i) => <circle key={`a${i}`} cx={sx(v)} cy={ROW_A} r="5" fill="#2ab8eb" opacity="0.8" />)}
        {B.map((v, i) => <circle key={`b${i}`} cx={sx(v)} cy={ROW_B} r="5" fill="#6b7280" opacity="0.7" />)}
        <text x={PAD} y={H - 8} fill="#9a907c" fontSize="10">значение (ранги важнее самих чисел) →</text>
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-[#2ab8eb]">P(A &gt; B) = {(ps * 100).toFixed(0)}%</span>
        <span className="text-gray-600">U = {U}</span>
        <span className={sig ? 'text-green-600' : 'text-gray-600'}>p ≈ {p < 0.001 ? '<0.001' : p.toFixed(3)} {sig ? '→ значимо' : '→ не значимо'}</span>
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Сдвиг группы A</span><span className="tabular-nums text-cyanink">+{shift}</span></div>
        <input type="range" min="-10" max="30" step="1" value={shift} onChange={(e) => setShift(Number(e.target.value))} className="w-full accent-accent" />
      </label>

      <div className="flex items-center gap-3 mt-3">
        <button onClick={() => setOutlier((o) => !o)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">
          {outlier ? 'убрать выброс' : 'добавить выброс в A'}
        </button>
        <span className="text-xs text-gray-500">Выброс почти не двигает U: ранг гигантского значения всё равно «последний». Этим МУ устойчив там, где t-тест шатается.</span>
      </div>
    </div>
  )
}
