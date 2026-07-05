import { useState } from 'react'

// Утечка данных: метрика на тесте взлетает, а в проде — нет. Тумблеры включают
// два вида утечки: признак «из будущего» и предобработку ДО разделения.
// Видно: тест отрывается от прода — оценка фальшивая.
const W = 460
const H = 220
const PAD = 40

export default function DataLeakage({ locale = 'ru' }) {
  const en = locale === 'en'
  const [future, setFuture] = useState(false)
  const [prep, setPrep] = useState(false)

  const prod = 0.77
  let train = 0.82
  let test = 0.78
  if (future) { train += 0.17; test += 0.20 } // тест почти идеален
  if (prep) { train += 0.03; test += 0.06 } // тест слегка завышен
  train = Math.min(0.99, train); test = Math.min(0.99, test)
  const gap = test - prod
  const leaking = gap > 0.03

  const bars = [
    { label: 'train', v: train, c: '#9ca3af' },
    { label: 'test', v: test, c: leaking ? '#dc4d4d' : '#2ab8eb' },
    { label: en ? 'prod' : 'прод', v: prod, c: '#16a34a' },
  ]
  const sy = (v) => H - PAD - v * (H - 2 * PAD)
  const bw = (W - 2 * PAD) / 3

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {[0.5, 0.75, 1].map((g) => <g key={g}><line x1={PAD} y1={sy(g)} x2={W - PAD} y2={sy(g)} stroke="#e7e1d4" /><text x={PAD - 6} y={sy(g) + 3} fill="#9ca3af" fontSize="9" textAnchor="end">{g}</text></g>)}
        {bars.map((b, i) => {
          const cx = PAD + bw * (i + 0.5)
          return (
            <g key={b.label}>
              <rect x={cx - 28} y={sy(b.v)} width="56" height={H - PAD - sy(b.v)} fill={b.c} opacity="0.85" rx="2" />
              <text x={cx} y={sy(b.v) - 6} fill="#2a2f3a" fontSize="12" textAnchor="middle">{(b.v * 100).toFixed(0)}%</text>
              <text x={cx} y={H - PAD + 14} fill="#6b7280" fontSize="11" textAnchor="middle">{b.label}</text>
            </g>
          )
        })}
      </svg>

      <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${leaking ? 'border-[#dc4d4d]/30 bg-[#dc4d4d]/5 text-gray-700' : 'border-green-500/30 bg-green-500/5 text-gray-700'}`}>
        {leaking
          ? (en
            ? `The test (${(test * 100).toFixed(0)}%) is far above production (${(prod * 100).toFixed(0)}%) — the estimate is fake. "Too good" = leakage, not a genius model.`
            : `Тест (${(test * 100).toFixed(0)}%) намного выше прода (${(prod * 100).toFixed(0)}%) — оценка фальшивая. «Слишком хорошо» = утечка, а не гениальная модель.`)
          : (en
            ? `Test ≈ production (${(test * 100).toFixed(0)}% vs ${(prod * 100).toFixed(0)}%) — an honest estimate. The test predicts the real quality.`
            : `Тест ≈ прод (${(test * 100).toFixed(0)}% vs ${(prod * 100).toFixed(0)}%) — честная оценка. Тест предсказывает реальное качество.`)}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <button onClick={() => setFuture((f) => !f)} className={`text-xs px-2.5 py-1 rounded-md border ${future ? 'border-[#dc4d4d]/50 bg-[#dc4d4d]/10 text-[#dc4d4d]' : 'border-black/15 text-gray-700 hover:bg-black/5'}`}>{en ? 'feature from the future' : 'признак «из будущего»'}</button>
        <button onClick={() => setPrep((p) => !p)} className={`text-xs px-2.5 py-1 rounded-md border ${prep ? 'border-[#dc4d4d]/50 bg-[#dc4d4d]/10 text-[#dc4d4d]' : 'border-black/15 text-gray-700 hover:bg-black/5'}`}>{en ? 'preprocessing before the split' : 'предобработка до сплита'}</button>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'Production quality (green) is the real one — it does not change. Leakage inflates only train/test: a "feature from the future" (say, the account closure date when predicting churn) gives away the answer; preprocessing on all the data before the split lets the test peek into training. The goal of validation is test ≈ production.'
        : 'Прод-качество (зелёное) — настоящее, оно не меняется. Утечка раздувает только train/test: «признак из будущего» (например, дата закрытия счёта при прогнозе оттока) выдаёт ответ; предобработка на всех данных до сплита даёт тесту подсмотреть в обучение. Цель валидации — чтобы тест ≈ прод.'}</p>
    </div>
  )
}
