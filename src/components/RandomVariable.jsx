import { useMemo, useState } from 'react'

// Случайная величина: исходы → значения с вероятностями. Показываем
// математическое ожидание E[X] как «точку баланса» и дисперсию Var[X].
// Тумблер «сумма двух независимых» демонстрирует: E и Var СКЛАДЫВАЮТСЯ,
// а форма тянется к колоколу (зерно ЦПТ).
const W = 560
const H = 230
const PAD = 36
const BASE = H - PAD
const TOP = 24
const VALUES = [1, 2, 3, 4, 5]

export default function RandomVariable() {
  const [w, setW] = useState([1, 2, 4, 2, 1]) // веса → вероятности
  const [sum, setSum] = useState(false)

  const p = useMemo(() => { const s = w.reduce((a, b) => a + b, 0) || 1; return w.map((x) => x / s) }, [w])
  const EX = VALUES.reduce((a, v, i) => a + v * p[i], 0)
  const VarX = VALUES.reduce((a, v, i) => a + p[i] * (v - EX) ** 2, 0)

  // распределение суммы двух независимых копий (свёртка)
  const conv = useMemo(() => {
    const m = {}
    for (let i = 0; i < VALUES.length; i++) for (let j = 0; j < VALUES.length; j++) {
      const s = VALUES[i] + VALUES[j]
      m[s] = (m[s] || 0) + p[i] * p[j]
    }
    return m
  }, [p])
  const sumVals = Object.keys(conv).map(Number).sort((a, b) => a - b)

  const dom = sum ? [2, 10] : [1, 5]
  const sx = (x) => PAD + ((x - dom[0]) / (dom[1] - dom[0])) * (W - 2 * PAD)
  const bars = sum ? sumVals.map((v) => ({ v, prob: conv[v] })) : VALUES.map((v, i) => ({ v, prob: p[i] }))
  const maxP = Math.max(...bars.map((b) => b.prob), 0.01)
  const sy = (q) => BASE - (q / maxP) * (BASE - TOP)
  const ex = sum ? 2 * EX : EX
  const varx = sum ? 2 * VarX : VarX
  const bw = sum ? 18 : 40

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {bars.map((b) => (
          <g key={b.v}>
            <rect x={sx(b.v) - bw / 2} y={sy(b.prob)} width={bw} height={BASE - sy(b.prob)} fill="#2ab8eb" opacity="0.8" rx="2" />
            <text x={sx(b.v)} y={BASE + 14} fill="#6b7280" fontSize="10" textAnchor="middle">{b.v}</text>
          </g>
        ))}
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        {/* E[X] — точка баланса */}
        <polygon points={`${sx(ex)},${BASE + 2} ${sx(ex) - 6},${BASE + 12} ${sx(ex) + 6},${BASE + 12}`} fill="#16a34a" />
        <text x={sx(ex)} y={BASE + 26} fill="#16a34a" fontSize="10" textAnchor="middle">E[X] = {ex.toFixed(2)}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#16a34a]">E[X] = {ex.toFixed(2)} (точка баланса)</span>
        <span className="text-[#2ab8eb]">Var[X] = {varx.toFixed(2)}</span>
        <span className="text-gray-500">σ = {Math.sqrt(varx).toFixed(2)}</span>
      </div>

      {!sum && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-1">Вероятности исходов (двигайте веса):</div>
          <div className="grid grid-cols-5 gap-2">
            {VALUES.map((v, i) => (
              <label key={v} className="text-xs">
                <div className="text-center text-gray-600 mb-1">{v}: {(p[i] * 100).toFixed(0)}%</div>
                <input type="range" min="0" max="6" step="1" value={w[i]} onChange={(e) => setW((arr) => arr.map((x, k) => (k === i ? Number(e.target.value) : x)))} className="w-full accent-accent" />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        <button onClick={() => setSum((s) => !s)} className="text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">
          {sum ? '← одна величина X' : 'показать сумму двух независимых X+X'}
        </button>
        {sum && <span className="text-xs text-gray-500">E удвоилось ({(2 * EX).toFixed(2)}), Var удвоилась ({(2 * VarX).toFixed(2)}), форма ближе к колоколу.</span>}
      </div>
      <p className="text-xs text-gray-500 mt-2">E[X] — «центр тяжести» значений с весами-вероятностями. Var[X] = E[(X−E[X])²] — средний квадрат отклонения. У суммы НЕЗАВИСИМЫХ величин и E, и Var складываются — это и даёт σ/√n у среднего и колокол в ЦПТ.</p>
    </div>
  )
}
