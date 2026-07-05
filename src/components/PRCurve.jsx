import { useMemo, useState } from 'react'

// Дисбаланс классов: ROC/AUC почти не зависят от редкости класса, а precision —
// рушится. Показываем PR-кривую (precision vs recall) и как она проседает при
// редком классе, хотя AUC высокий.
const W = 360
const H = 300
const PAD = 42

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const sf = (z) => 0.5 * (1 - erf(z / Math.SQRT2)) // P(N(0,1) > z)

export default function PRCurve({ locale = 'ru' }) {
  const en = locale === 'en'
  const [prev, setPrev] = useState(0.05) // доля положительного класса
  const [sep, setSep] = useState(2.0) // разделимость (сдвиг распределения позитивов)

  const { pts, auc, prAtR } = useMemo(() => {
    const pts = []
    let auc = 0
    let prev2 = null
    let prAtR = null
    for (let t = 4; t >= -4; t -= 0.08) {
      const tpr = sf((t - sep)) // P(pos > t), pos ~ N(sep,1)
      const fpr = sf(t) // P(neg > t), neg ~ N(0,1)
      const tp = prev * tpr
      const fp = (1 - prev) * fpr
      const precision = tp + fp > 0 ? tp / (tp + fp) : 1
      pts.push({ recall: tpr, precision, fpr })
      if (prAtR == null && tpr >= 0.8) prAtR = precision
    }
    // ROC AUC трапециями (по fpr)
    const roc = pts.map((p) => ({ x: p.fpr, y: p.recall })).sort((a, b) => a.x - b.x)
    for (let i = 1; i < roc.length; i++) auc += (roc[i].x - roc[i - 1].x) * (roc[i].y + roc[i - 1].y) / 2
    return { pts, auc, prAtR }
  }, [prev, sep])

  const sx = (v) => PAD + v * (W - 2 * PAD)
  const sy = (v) => H - PAD - v * (H - 2 * PAD)
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.recall).toFixed(1)},${sy(p.precision).toFixed(1)}`).join(' ')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {/* линия «уровень случайной модели» = prevalence */}
        <line x1={sx(0)} y1={sy(prev)} x2={sx(1)} y2={sy(prev)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 4" />
        <text x={sx(1)} y={sy(prev) - 4} fill="#9ca3af" fontSize="9" textAnchor="end">{en ? 'random' : 'случайная'} = {(prev * 100).toFixed(0)}%</text>
        <path d={d} fill="none" stroke="#2ab8eb" strokeWidth="2.5" />
        <text x={W / 2} y={H - 10} fill="#6b7280" fontSize="11" textAnchor="middle">Recall →</text>
        <text x={14} y={H / 2} fill="#6b7280" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${H / 2})`}>Precision →</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-gray-700">ROC-AUC ≈ {auc.toFixed(2)} <span className="text-gray-500">{en ? '(barely depends on rarity)' : '(почти не зависит от редкости)'}</span></span>
        <span className={prAtR < 0.5 ? 'text-[#dc4d4d]' : 'text-green-600'}>{en ? 'Precision at recall 80% ≈' : 'Precision при recall 80% ≈'} {(prAtR * 100).toFixed(0)}%</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Rare class share' : 'Доля редкого класса'}</span><span className="text-cyanink">{(prev * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.01" max="0.5" step="0.01" value={prev} onChange={(e) => setPrev(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Class separability' : 'Разделимость классов'}</span><span className="text-cyanink">{sep.toFixed(1)}</span></div>
          <input type="range" min="0.5" max="3.5" step="0.1" value={sep} onChange={(e) => setSep(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'Shrink the class share: ROC-AUC barely changes (looks "fine") while the PR curve and precision at a fixed recall collapse. On a rare class you watch PR, not ROC/accuracy.'
        : 'Уменьшайте долю класса: ROC-AUC почти не меняется (выглядит «хорошо»), а PR-кривая и precision при фиксированном recall обваливаются. На редком классе смотрят PR, а не ROC/accuracy.'}</p>
    </div>
  )
}
