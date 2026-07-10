import { useMemo, useState } from 'react'

// Диагностика регрессии по ОСТАТКАМ. Переключаем тип данных и смотрим график
// остатков: бесструктурное облако = ок; дуга = нелинейность; веер =
// гетероскедастичность; одинокая точка = влиятельный выброс.
const W = 460
const H = 230
const PAD = 38
const N = 40

function randn(i) { // детерминированный псевдошум
  const x = Math.sin(i * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}
const MODES = {
  ok: { label: 'всё ок', labelEn: 'all fine', verdict: 'Остатки — бесструктурное облако вокруг нуля. Прямая уместна.', verdictEn: 'The residuals are a structureless cloud around zero. A straight line is appropriate.', good: true },
  curve: { label: 'нелинейность', labelEn: 'nonlinearity', verdict: 'Остатки изгибаются дугой (систематический провал в середине и подъём по краям, а не случайный шум) — связь не линейна. Нужен нелинейный член или преобразование.', verdictEn: 'The residuals bend in an arc (a systematic sag in the middle and rise at the edges, not random noise) — the relationship is not linear. You need a nonlinear term or a transformation.', good: false },
  hetero: { label: 'гетероскедастичность', labelEn: 'heteroscedasticity', verdict: 'Разброс остатков растёт с x (веер). Оценка наклона ещё годна, но её значимость и интервалы неверны. Лечат логарифмом / робастными ошибками.', verdictEn: 'The spread of residuals grows with x (a fan). The slope estimate is still usable, but its significance and intervals are wrong. Treated with a log transform / robust errors.', good: false },
  outlier: { label: 'выброс', labelEn: 'outlier', verdict: 'Одна далёкая точка (высокий рычаг) тянет линию на себя. Проверьте влиятельные наблюдения и модель без них.', verdictEn: 'One distant point (high leverage) pulls the line toward itself. Check influential observations and the model without them.', good: false },
}

export default function ResidualDiagnostics({ locale = 'ru' }) {
  const en = locale === 'en'
  const [mode, setMode] = useState('ok')
  const pts = useMemo(() => {
    const arr = []
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / N // 0..1
      let r = randn(i) * 0.5
      if (mode === 'curve') r += 1.6 * (x - 0.5) ** 2 * 4 - 0.5 // дуга
      if (mode === 'hetero') r = randn(i) * (0.15 + x * 1.6) // веер
      if (mode === 'outlier' && i === N - 3) r = 2.6 // одинокий выброс
      arr.push({ x, r })
    }
    return arr
  }, [mode])

  const sx = (x) => PAD + x * (W - 2 * PAD)
  const sy = (r) => H / 2 - r * ((H - 2 * PAD) / 6)
  const m = MODES[mode]

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} onClick={() => setMode(k)} className={`text-xs px-2.5 py-1 rounded-md border ${mode === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? v.labelEn : v.label}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={W - PAD} y={H / 2 - 6} fill="#9a907c" fontSize="10" textAnchor="end">{en ? 'residual = 0' : 'остаток = 0'}</text>
        {pts.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.r)} r="3.5" fill={Math.abs(p.r) > 2 ? '#dc4d4d' : '#2ab8eb'} opacity="0.75" />)}
        <text x={PAD} y={H - 8} fill="#9a907c" fontSize="10">x →</text>
        <text x={PAD} y={16} fill="#9a907c" fontSize="10" textAnchor="start">{en ? 'residual' : 'остаток'}</text>
      </svg>
      <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${m.good ? 'border-green-500/30 bg-green-500/5' : 'border-amber-400/40 bg-amber-400/[0.07]'} text-gray-700`}>{en ? m.verdictEn : m.verdict}</div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'A good regression leaves the residuals as structureless noise around zero. Any pattern in the residuals is a signal the line cannot be trusted, whatever the R². That is why this chart is always checked after a regression.'
        : 'Хорошая регрессия оставляет остатки бесструктурным шумом вокруг нуля. Любая закономерность в остатках — сигнал, что прямой верить нельзя, каким бы ни был R². Поэтому после регрессии всегда смотрят этот график.'}</p>
    </div>
  )
}
