import { useMemo, useState } from 'react'

// Снижение дисперсии. Два метода в одном виджете:
//  • CUPED — вычесть предсказуемую ковариатом часть: Y' = Y − θ(X − X̄),
//    дисперсия падает в (1−ρ²) раз.
//  • Стратификация — разбить на однородные слои и сравнивать внутри них:
//    из общей дисперсии уходит межслойная часть σ²_между / σ²_общая.
// У обоих одна суть — убрать предсказуемый разброс, оставить эффект — и один
// правый график: как сужается распределение метрики после поправки.
const SW = 250, SH = 170, SP = 26
const RW = 250, RH = 170, RP = 24
const STRATA = [{ c: '#2ab8eb', label: 'слой 1' }, { c: '#f59e0b', label: 'слой 2' }, { c: '#7c3aed', label: 'слой 3' }]

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function VarianceReduction() {
  const [method, setMethod] = useState('cuped')
  const [rho, setRho] = useState(0.7)
  const [delta, setDelta] = useState(1.2) // разброс между слоями (стратификация)
  // фиксированный шум, чтобы точки не «прыгали» при движении ползунка
  const noise = useMemo(() => Array.from({ length: 72 }, () => [randn(), randn()]), [])

  // доля убранной дисперсии для каждого метода
  const between = (2 * delta * delta) / 3 // дисперсия средних слоёв {−Δ,0,+Δ}
  const reduction = method === 'cuped' ? rho * rho : between / (1 + between)
  const sdAfter = Math.sqrt(1 - reduction)
  const nFactor = 1 / (1 - reduction)

  // левая панель, CUPED: скаттер ковариат(X) ↔ метрика(Y) с корреляцией rho
  const lx = (z) => SP + ((z + 3) / 6) * (SW - 2 * SP)
  const ly = (z) => SH - SP - ((z + 3) / 6) * (SH - 2 * SP)
  const cupedPts = noise.map(([a, b]) => [a, rho * a + Math.sqrt(1 - rho * rho) * b])

  // левая панель, стратификация: 3 колонки-слоя, точки внутри + средние слоёв
  const totalSd = Math.sqrt(1 + between)
  const stratMean = [-delta, 0, delta].map((m) => m / totalSd) // стандартизованные средние
  const colX = [0.28, 0.5, 0.72].map((f) => SP + f * (SW - 2 * SP))

  // правая панель: два колокола — до (общая) и после (внутрислойная / скорректированная)
  const phi = (x, s) => Math.exp(-0.5 * (x / s) ** 2) / s
  const rx = (x) => RP + ((x + 4) / 8) * (RW - 2 * RP)
  const yMax = phi(0, sdAfter)
  const ry = (y) => RH - RP - (y / yMax) * (RH - 2 * RP - 6)
  const curve = (s) => { let d = ''; for (let i = 0; i <= 120; i++) { const x = -4 + (8 * i) / 120; d += `${i === 0 ? 'M' : 'L'}${rx(x).toFixed(1)},${ry(phi(x, s)).toFixed(1)} ` } return d }

  const formula = method === 'cuped'
    ? "Y' = Y − θ·(X − X̄),  θ = Cov(X,Y)/Var(X)  →  Var(Y') = Var(Y)·(1−ρ²)"
    : 'Var_страт = Σ wₖ·σ²ₖ (внутри слоёв)  →  убирает σ²_между / σ²_общая'

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-600 mr-1">Метод:</span>
        <button onClick={() => setMethod('cuped')} className={`text-xs px-2.5 py-1 rounded border ${method === 'cuped' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>CUPED (ковариат)</button>
        <button onClick={() => setMethod('strat')} className={`text-xs px-2.5 py-1 rounded border ${method === 'strat' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>Стратификация (слои)</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* левая панель зависит от метода */}
        <svg viewBox={`0 0 ${SW} ${SH}`} className="w-full h-auto select-none">
          {method === 'cuped' ? (
            <>
              <text x={SW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">ковариат (до) ↔ метрика, ρ = {rho.toFixed(2)}</text>
              <line x1={SP} y1={SH - SP} x2={SW - SP} y2={SH - SP} stroke="#d6cebf" strokeWidth="1" />
              <line x1={SP} y1={SP} x2={SP} y2={SH - SP} stroke="#d6cebf" strokeWidth="1" />
              {cupedPts.map(([x, y], i) => <circle key={i} cx={lx(x)} cy={ly(y)} r="3" fill="#2ab8eb" opacity="0.6" />)}
            </>
          ) : (
            <>
              <text x={SW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">слои различаются на Δ = {delta.toFixed(1)}</text>
              <line x1={SP} y1={SH - SP} x2={SW - SP} y2={SH - SP} stroke="#d6cebf" strokeWidth="1" />
              {noise.map(([a, b], i) => {
                const s = i % 3
                return <circle key={i} cx={colX[s] + b * 9} cy={ly(stratMean[s] + sdAfter * a)} r="3" fill={STRATA[s].c} opacity="0.55" />
              })}
              {stratMean.map((m, s) => (
                <line key={s} x1={colX[s] - 20} y1={ly(m)} x2={colX[s] + 20} y2={ly(m)} stroke={STRATA[s].c} strokeWidth="2.5" />
              ))}
              {STRATA.map((st, s) => <text key={s} x={colX[s]} y={SH - SP + 12} fill={st.c} fontSize="9" textAnchor="middle">{st.label}</text>)}
            </>
          )}
        </svg>

        {/* правая панель: сужение распределения (общая для обоих методов) */}
        <svg viewBox={`0 0 ${RW} ${RH}`} className="w-full h-auto select-none">
          <text x={RW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">дисперсия метрики: до → после</text>
          <line x1={RP} y1={RH - RP} x2={RW - RP} y2={RH - RP} stroke="#d6cebf" strokeWidth="1" />
          <path d={curve(1)} fill="none" stroke="#9ca3af" strokeWidth="2" />
          <path d={curve(sdAfter)} fill="none" stroke="#2ab8eb" strokeWidth="2" />
          <text x={RW - RP} y={28} fill="#9ca3af" fontSize="10" textAnchor="end">до (общая)</text>
          <text x={RW - RP} y={42} fill="#2ab8eb" fontSize="10" textAnchor="end">после (уже)</text>
        </svg>
      </div>

      <div className="mt-2 rounded bg-ink/50 px-3 py-1.5 font-mono text-[11px] text-cyanink overflow-x-auto">{formula}</div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
        <span className="text-[#2ab8eb]">дисперсия −{(reduction * 100).toFixed(0)}%</span>
        <span className="text-gray-700">эквивалентно ×{nFactor.toFixed(1)} к объёму данных</span>
        <span className="text-gray-500">нужно ~{(100 * (1 - reduction)).toFixed(0)}% прежней выборки</span>
      </div>

      {method === 'cuped' ? (
        <label className="block mt-3 text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>Корреляция ковариата с метрикой ρ</span><span className="tabular-nums text-cyanink">{rho.toFixed(2)}</span></div>
          <input type="range" min="0" max="0.95" step="0.05" value={rho} onChange={(e) => setRho(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      ) : (
        <label className="block mt-3 text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>Насколько слои различаются между собой, Δ</span><span className="tabular-nums text-cyanink">{delta.toFixed(1)}</span></div>
          <input type="range" min="0" max="2.4" step="0.1" value={delta} onChange={(e) => setDelta(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      )}

      <p className="text-xs text-gray-500 mt-2">{method === 'cuped'
        ? 'CUPED: чем сильнее доэкспериментальный ковариат предсказывает метрику (выше ρ), тем больше дисперсии убирается — на (1−ρ²), — и тем чувствительнее тест при том же n.'
        : 'Стратификация: чем сильнее слои различаются между собой (больше Δ), тем большая доля разброса была МЕЖслойной — и тем больше её убирает сравнение внутри слоёв. Внутрислойный разброс (синий колокол) остаётся, межслойный уходит.'}</p>
    </div>
  )
}
