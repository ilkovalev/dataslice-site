import { useState } from 'react'

// База + точность теста → доля реально больных среди положительных.
// Показывает, как редкость события рождает уйму ложных срабатываний.
const W = 560
const H = 90
const PAD = 20

export default function BayesGrid() {
  const [prev, setPrev] = useState(0.01) // распространённость
  const [acc, setAcc] = useState(0.9) // точность теста
  const N = 1000
  const sick = prev * N
  const healthy = N - sick
  const tp = sick * acc
  const fp = healthy * (1 - acc)
  const pos = tp + fp
  const pSick = pos ? tp / pos : 0

  const barW = W - 2 * PAD
  const tpW = pos ? (tp / pos) * barW : 0

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="text-sm text-gray-600 mb-2">
        Из {N} человек больны ≈ <span className="text-gray-900">{Math.round(sick)}</span>, тест положителен у ≈ <span className="text-gray-900">{Math.round(pos)}</span>.
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <text x={PAD} y={18} fill="#6b7280" fontSize="11">Все положительные тесты:</text>
        <rect x={PAD} y={28} width={tpW} height={34} fill="#2ab8eb" opacity="0.85" />
        <rect x={PAD + tpW} y={28} width={barW - tpW} height={34} fill="#fbbf24" opacity="0.7" />
        <text x={PAD + 6} y={50} fill="#ffffff" fontSize="12">реально больны: {Math.round(tp)}</text>
        <text x={W - PAD - 6} y={78} fill="#fbbf24" fontSize="11" textAnchor="end">ложное срабатывание: {Math.round(fp)}</text>
      </svg>

      <div className="mt-3 text-lg">
        P(болен | тест положителен) = <span className="text-cyanink font-semibold">{(pSick * 100).toFixed(0)}%</span>
      </div>

      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-3 py-2.5 text-sm">
        <div className="text-xs text-gray-500 mb-1">Теорема Байеса (числа подставляются вживую):</div>
        <div className="font-mono text-gray-800 leading-relaxed">
          P(болен | +) = <span className="text-cyanink">P(болен)·P(+|болен)</span> / [ P(болен)·P(+|болен) + P(здоров)·P(+|здоров) ]
        </div>
        <div className="font-mono text-gray-700 leading-relaxed mt-1">
          = ({prev.toFixed(3)}·{acc.toFixed(2)}) / [ {prev.toFixed(3)}·{acc.toFixed(2)} + {(1 - prev).toFixed(3)}·{(1 - acc).toFixed(2)} ]
          = <span className="text-cyanink font-semibold">{(pSick * 100).toFixed(0)}%</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">P(болен) — базовая ставка (распространённость), P(+|болен) — точность теста. Двигайте ползунки — формула пересчитывается.</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Распространённость болезни</span><span className="text-cyanink">{(prev * 100).toFixed(1)}%</span></div>
          <input type="range" min="0.005" max="0.5" step="0.005" value={prev} onChange={(e) => setPrev(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Точность теста</span><span className="text-cyanink">{(acc * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.5" max="0.99" step="0.01" value={acc} onChange={(e) => setAcc(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
    </div>
  )
}
