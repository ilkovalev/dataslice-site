import { useState } from 'react'

// Наглядный p-value: распределение результата ПРИ ВЕРНОЙ H0 (эффекта нет).
// Двигаем наблюдаемый результат — p-value это площадь «хвостов» за ним:
// вероятность получить такой же или более экстремальный результат чисто случайно.
const W = 520
const H = 240
const PAD = 38
const TOP = 26
const BASE = H - PAD
const XLO = -4
const XHI = 4

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
const pdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
const PEAK = pdf(0)

export default function PValueExplorer() {
  const [obs, setObs] = useState(2.2) // наблюдаемый результат в стандартных ошибках от 0

  const sx = (x) => PAD + ((x - XLO) / (XHI - XLO)) * (W - 2 * PAD)
  const sy = (d) => BASE - (d / PEAK) * (BASE - TOP)
  const a = Math.abs(obs)
  const p = 2 * (1 - cdf(a)) // двусторонний p-value
  const sig = p < 0.05

  const curve = () => {
    let s = ''
    for (let i = 0; i <= 200; i++) { const x = XLO + (i / 200) * (XHI - XLO); s += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(pdf(x)).toFixed(1)} ` }
    return s
  }
  const tail = (from, to) => {
    let s = `M${sx(from).toFixed(1)},${BASE} `
    const n = 60
    for (let i = 0; i <= n; i++) { const x = from + (i / n) * (to - from); s += `L${sx(x).toFixed(1)},${sy(pdf(x)).toFixed(1)} ` }
    s += `L${sx(to).toFixed(1)},${BASE} Z`
    return s
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        {/* хвосты = p-value */}
        <path d={tail(XLO, -a)} fill="#dc4d4d" opacity="0.35" />
        <path d={tail(a, XHI)} fill="#dc4d4d" opacity="0.35" />
        {/* кривая H0 */}
        <path d={curve()} fill="none" stroke="#9ca3af" strokeWidth="2" />
        {/* порог ±1.96 (p=0.05) */}
        {[-1.96, 1.96].map((v) => <line key={v} x1={sx(v)} y1={BASE - 6} x2={sx(v)} y2={BASE + 4} stroke="#c69214" strokeWidth="1.5" />)}
        <text x={sx(1.96)} y={BASE + 16} fill="#c69214" fontSize="9" textAnchor="middle">±1.96 · p=0.05</text>
        {/* наблюдаемый результат */}
        {[-a, a].map((v, i) => <line key={i} x1={sx(v)} y1={TOP} x2={sx(v)} y2={BASE} stroke="#2ab8eb" strokeWidth="2" />)}
        <text x={sx(a)} y={TOP - 8} fill="#0d7fb0" fontSize="10" textAnchor="middle">наблюдали: {obs.toFixed(2)}</text>
        <text x={sx(0)} y={TOP + 4} fill="#6b7280" fontSize="10" textAnchor="middle">H0: эффекта нет</text>
        <text x={PAD} y={H - 8} fill="#9a907c" fontSize="10" textAnchor="start">результат в стандартных ошибках от нуля →</text>
      </svg>

      <div className="mt-1 text-sm">
        <span className="text-[#dc4d4d] font-semibold">p-value = {p < 0.001 ? '<0.001' : p.toFixed(3)}</span>{' '}
        — это красная площадь: вероятность получить результат настолько же или более далёкий от нуля, ЕСЛИ эффекта нет.{' '}
        {sig
          ? <span className="text-green-600">p &lt; 0.05 → такой результат при «эффекта нет» маловероятен, отвергаем H0.</span>
          : <span className="text-gray-600">p ≥ 0.05 → случайностью объяснить легко, H0 не отвергаем.</span>}
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Наблюдаемый результат (в стандартных ошибках)</span><span className="text-cyanink">{obs.toFixed(2)}</span></div>
        <input type="range" min="0" max="3.5" step="0.05" value={obs} onChange={(e) => setObs(Number(e.target.value))} className="w-full accent-accent" />
      </label>
      <p className="text-xs text-gray-500 mt-2">Серый колокол — как «гулял» бы результат чисто от случайности, если эффекта нет (H0). Двигайте синюю линию (наблюдаемый результат): красные хвосты за ней — это p-value. Чем дальше результат от нуля, тем тоньше хвосты и меньше p. На отметке ±1.96 площадь хвостов ровно 0.05 — отсюда и знаменитый порог. Важно: p — это НЕ «вероятность, что H0 верна», а «насколько такие данные обычны при H0».</p>
    </div>
  )
}
