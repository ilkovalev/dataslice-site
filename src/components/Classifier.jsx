import { useMemo, useState } from 'react'

// Калькулятор ошибок классификатора. Письма с оценкой «похоже на спам».
// Порог делит на спам/не спам; ползунок «разделимость» раздвигает классы.
// Матрица ошибок + все метрики: Precision, Recall (=TPR), FPR, Accuracy.
const W = 580
const H = 150
const PAD = 36
const SPAM_Y = 58
const HAM_Y = 100

// базовые оценки (центрированы около 50); separation раздвигает их симметрично
const HAM0 = [-18, -14, -11, -9, -7, -5, -3, -1, 2, 5, 8, 12]
const SPAM0 = [-12, -8, -5, -2, 1, 3, 5, 7, 10, 13, 17, 22]

export default function Classifier({ locale = 'ru' }) {
  const en = locale === 'en'
  const [thr, setThr] = useState(50)
  const [sep, setSep] = useState(8)
  const { HAM, SPAM } = useMemo(() => ({
    HAM: HAM0.map((v) => Math.max(5, Math.min(95, 45 + v - sep))),
    SPAM: SPAM0.map((v) => Math.max(5, Math.min(95, 55 + v + sep))),
  }), [sep])
  const sx = (x) => PAD + (x / 100) * (W - 2 * PAD)

  const tp = SPAM.filter((s) => s >= thr).length
  const fn = SPAM.length - tp
  const fp = HAM.filter((s) => s >= thr).length
  const tn = HAM.length - fp
  const precision = tp + fp ? tp / (tp + fp) : 0
  const recall = tp + fn ? tp / (tp + fn) : 0
  const fpr = fp + tn ? fp / (fp + tn) : 0
  const accuracy = (tp + tn) / (tp + tn + fp + fn)

  const dot = (arr, y, color) =>
    arr.map((s, i) => <circle key={i} cx={sx(s)} cy={y} r="6" fill={color} opacity={s >= thr ? 1 : 0.35} />)

  const stat = (label, val, color) => (
    <div className="flex justify-between gap-3"><span className="text-gray-600">{label}</span><span className={`tabular-nums font-medium ${color}`}>{(val * 100).toFixed(0)}%</span></div>
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <rect x={sx(thr)} y={20} width={W - PAD - sx(thr)} height={H - 40} fill="#2ab8eb" opacity="0.06" />
        <text x={W - PAD} y={16} fill="#2ab8eb" fontSize="10" textAnchor="end">{en ? '→ marked as spam' : '→ помечаем спамом'}</text>
        <text x={8} y={SPAM_Y + 4} fill="#2ab8eb" fontSize="11">{en ? 'spam' : 'спам'}</text>
        <text x={8} y={HAM_Y + 4} fill="#6b7280" fontSize="11">{en ? 'not spam' : 'не спам'}</text>
        {dot(SPAM, SPAM_Y, '#2ab8eb')}
        {dot(HAM, HAM_Y, '#6b7280')}
        <line x1={sx(thr)} y1={20} x2={sx(thr)} y2={H - 20} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(thr)} y={H - 6} fill="#2a2f3a" fontSize="10" textAnchor="middle">{en ? 'threshold' : 'порог'}</text>
      </svg>

      <div className="grid sm:grid-cols-2 gap-4 mt-3">
        <div className="text-xs text-gray-600">
          <div className="grid grid-cols-3 gap-px text-center">
            <span></span><span className="text-gray-500">{en ? 'pred. spam' : 'пред. спам'}</span><span className="text-gray-500">{en ? 'pred. not spam' : 'пред. не спам'}</span>
            <span className="text-gray-500 self-center text-left">{en ? 'actually spam' : 'реально спам'}</span><span className="bg-[#2ab8eb]/15 py-1 rounded">TP {tp}</span><span className="bg-[#f87171]/15 py-1 rounded">FN {fn}</span>
            <span className="text-gray-500 self-center text-left">{en ? 'actually not spam' : 'реально не спам'}</span><span className="bg-[#fbbf24]/15 py-1 rounded">FP {fp}</span><span className="bg-black/5 py-1 rounded">TN {tn}</span>
          </div>
        </div>
        <div className="text-sm space-y-1">
          {stat(en ? 'Precision' : 'Precision (точность)', precision, 'text-cyanink')}
          {stat(en ? 'Recall = TPR' : 'Recall = TPR (полнота)', recall, 'text-cyanink')}
          {stat(en ? 'FPR (false alarms)' : 'FPR (ложные срабатывания)', fpr, 'text-amber-600')}
          {stat(en ? 'Accuracy (share correct)' : 'Accuracy (доля верных)', accuracy, 'text-gray-700')}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Threshold' : 'Порог'}</span><span className="tabular-nums text-cyanink">{thr}</span></div>
          <input type="range" min="20" max="85" step="1" value={thr} onChange={(e) => setThr(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Class separability' : 'Разделимость классов'}</span><span className="tabular-nums text-cyanink">{sep}</span></div>
          <input type="range" min="0" max="20" step="1" value={sep} onChange={(e) => setSep(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'Move the threshold — Precision and Recall trade off. Worse separability (overlapping classes) — both metrics fall. Accuracy is deceptive under imbalance: with little spam, "nothing is spam" gives high accuracy but Recall = 0.'
        : 'Двигайте порог — Precision и Recall обмениваются. Хуже разделимость (классы перекрыты) — обе метрики падают. Accuracy обманчива на дисбалансе: если спама мало, «всё не спам» даёт высокую accuracy, но Recall = 0.'}</p>
    </div>
  )
}
