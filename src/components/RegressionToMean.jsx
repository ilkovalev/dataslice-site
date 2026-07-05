import { useMemo, useState } from 'react'

// Регрессия к среднему: два замера одного и того же (тест1 и тест2). У кого
// результат на тесте1 экстремальный — частично повезло, поэтому на тесте2
// они в среднем СДВИГАЮТСЯ к среднему сами по себе, без всякого воздействия.
const W = 420
const H = 320
const PAD = 38
const N = 80

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function RegressionToMean({ locale = 'ru' }) {
  const en = locale === 'en'
  const [luck, setLuck] = useState(0.5) // доля удачи (0 — чистый навык, 1 — чистый шум)
  const base = useMemo(() => Array.from({ length: N }, () => [randn(), randn(), randn()]), [])

  const pts = base.map(([skill, n1, n2]) => {
    const t1 = Math.sqrt(1 - luck) * skill + Math.sqrt(luck) * n1
    const t2 = Math.sqrt(1 - luck) * skill + Math.sqrt(luck) * n2
    return [t1, t2]
  })
  const sx = (x) => PAD + ((x + 3) / 6) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y + 3) / 6) * (H - 2 * PAD)
  // верхние 20% по тесту1
  const thr = [...pts].map((p) => p[0]).sort((a, b) => b - a)[Math.floor(N * 0.2)]
  const top = pts.filter((p) => p[0] >= thr)
  const topT1 = top.reduce((a, p) => a + p[0], 0) / top.length
  const topT2 = top.reduce((a, p) => a + p[1], 0) / top.length

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto h-auto select-none">
        <defs>
          <marker id="rtmArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc4d4d" /></marker>
        </defs>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {/* диагональ «тест2 = тест1» (нет отката) */}
        <line x1={sx(-3)} y1={sy(-3)} x2={sx(3)} y2={sy(3)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 3" />
        <text x={sx(2.4)} y={sy(2.4) - 6} fill="#9ca3af" fontSize="9" textAnchor="middle">{en ? 'test 2 = test 1' : 'тест 2 = тест 1'}</text>
        {/* среднее по тесту 2 */}
        <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 3" />
        <text x={W - PAD} y={sy(0) - 3} fill="#9ca3af" fontSize="8" textAnchor="end">{en ? 'mean' : 'среднее'}</text>
        <line x1={sx(thr)} y1={PAD} x2={sx(thr)} y2={H - PAD} stroke="#fbbf24" strokeWidth="1" />
        {pts.map(([x, y], i) => <circle key={i} cx={sx(x)} cy={sy(y)} r="3.5" fill={x >= thr ? '#2ab8eb' : '#c9bfa9'} opacity={x >= thr ? 0.95 : 0.45} />)}
        {/* откат: от (topT1,topT1) на диагонали вниз к (topT1,topT2) среднему повтора */}
        <line x1={sx(topT1)} y1={sy(topT1)} x2={sx(topT1)} y2={sy(topT2) + 6} stroke="#dc4d4d" strokeWidth="2" markerEnd="url(#rtmArrow)" />
        <circle cx={sx(topT1)} cy={sy(topT2)} r="5.5" fill="#dc4d4d" />
        <text x={sx(topT1) + 8} y={sy((topT1 + topT2) / 2)} fill="#dc4d4d" fontSize="9">{en ? 'roll-back to the mean' : 'откат к среднему'}</text>
        <text x={W - PAD} y={H - PAD + 16} fill="#9a907c" fontSize="10" textAnchor="end">{en ? 'test 1 result (first time) →' : 'результат теста 1 (первый раз) →'}</text>
        <text x={PAD + 2} y={PAD - 8} fill="#9a907c" fontSize="10" textAnchor="start">{en ? 'test 2 result (repeat) ↑' : 'результат теста 2 (повтор) ↑'}</text>
        <text x={sx(thr) + 4} y={PAD + 10} fill="#d9a300" fontSize="9">{en ? 'top 20% by test 1' : 'топ-20% по тесту 1'}</text>
      </svg>
      <div className="text-sm text-gray-700 mt-1">
        {en ? <>The best by test 1 (yellow zone): on average <span className="text-[#2ab8eb]">{topT1.toFixed(2)}</span> on test 1, but already <span className="text-[#dc4d4d]">{topT2.toFixed(2)}</span> on the repeat — they rolled back toward the mean (0) by themselves, though nothing was done to them.</> : <>Лучшие по тесту 1 (жёлтая зона): в среднем <span className="text-[#2ab8eb]">{topT1.toFixed(2)}</span> на тесте 1, но уже <span className="text-[#dc4d4d]">{topT2.toFixed(2)}</span> на повторе — откатились к среднему (0) сами, хотя с ними ничего не делали.</>}
      </div>
      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Share of luck in the result' : 'Доля удачи в результате'}</span><span className="tabular-nums text-cyanink">{(luck * 100).toFixed(0)}%</span></div>
        <input type="range" min="0" max="1" step="0.05" value={luck} onChange={(e) => setLuck(Number(e.target.value))} className="w-full accent-accent" />
      </label>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'Each point is the same object measured TWICE (say, a salesperson over two months or a student on two quizzes). Result = stable SKILL + random LUCK. The "share of luck" is how random the result is: 0% — pure skill (the repeat matches the first time, points on the gray diagonal); 100% — pure chance (the repeat is unrelated to the first). The red arrow shows the roll-back: the best by test 1 are on average lower on the repeat — because their luck comes out differently this time. Move the slider: the more luck, the stronger the roll-back.'
        : 'Каждая точка — один и тот же объект, измеренный ДВАЖДЫ (например, продавец за два месяца или ученик на двух контрольных). Результат = устойчивый НАВЫК + случайная УДАЧА. «Доля удачи» — насколько результат случаен: 0% — чистый навык (повтор повторяет первый раз, точки на серой диагонали); 100% — чистый случай (повтор никак не связан с первым). Красная стрелка показывает откат: лучшие по тесту 1 на повторе в среднем ниже — потому что их удача в этот раз другая. Двигайте ползунок: чем больше удачи, тем сильнее откат.'}</p>
    </div>
  )
}
