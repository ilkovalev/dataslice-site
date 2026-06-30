import { useMemo, useState } from 'react'

// Снижение дисперсии (идея CUPED): если у метрики есть коррелирующий ковариат
// (например, поведение пользователя ДО эксперимента), вычитаем предсказуемую
// часть — и дисперсия падает в (1−ρ²) раз. Меньше дисперсия → выше чувствительность
// → нужно меньше пользователей для того же эффекта.
const W = 560
const H = 220
const PAD = 30

function randn() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export default function VarianceReduction() {
  const [rho, setRho] = useState(0.7)
  // фиксированный шум, чтобы точки не «прыгали» при движении ползунка
  const noise = useMemo(() => Array.from({ length: 70 }, () => [randn(), randn()]), [])

  const reduction = rho * rho // доля убранной дисперсии
  const sdAfter = Math.sqrt(1 - reduction)
  const nFactor = 1 / (1 - reduction) // во столько раз эффективнее по данным

  // левая панель: скаттер ковариат(X) vs метрика(Y) с корреляцией rho
  const SW = 250, SH = 160, SP = 26
  const lx = (z) => SP + ((z + 3) / 6) * (SW - 2 * SP)
  const ly = (z) => SH - SP - ((z + 3) / 6) * (SH - 2 * SP)
  const pts = noise.map(([a, b]) => [a, rho * a + Math.sqrt(1 - rho * rho) * b])

  // правая панель: два колокола — до и после
  const RW = 250, RH = 160, RP = 24
  const phi = (x, s) => Math.exp(-0.5 * (x / s) ** 2) / s
  const rx = (x) => RP + ((x + 4) / 8) * (RW - 2 * RP)
  const yMax = phi(0, sdAfter)
  const ry = (y) => RH - RP - (y / yMax) * (RH - 2 * RP - 6)
  const curve = (s) => { let d = ''; for (let i = 0; i <= 120; i++) { const x = -4 + (8 * i) / 120; d += `${i === 0 ? 'M' : 'L'}${rx(x).toFixed(1)},${ry(phi(x, s)).toFixed(1)} ` } return d }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <svg viewBox={`0 0 ${SW} ${SH}`} className="w-full h-auto select-none">
          <text x={SW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">ковариат (до) ↔ метрика, ρ = {rho.toFixed(2)}</text>
          <line x1={SP} y1={SH - SP} x2={SW - SP} y2={SH - SP} stroke="#d6cebf" strokeWidth="1" />
          <line x1={SP} y1={SP} x2={SP} y2={SH - SP} stroke="#d6cebf" strokeWidth="1" />
          {pts.map(([x, y], i) => <circle key={i} cx={lx(x)} cy={ly(y)} r="3" fill="#2ab8eb" opacity="0.6" />)}
        </svg>

        <svg viewBox={`0 0 ${RW} ${RH}`} className="w-full h-auto select-none">
          <text x={RW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">дисперсия метрики: до → после</text>
          <line x1={RP} y1={RH - RP} x2={RW - RP} y2={RH - RP} stroke="#d6cebf" strokeWidth="1" />
          <path d={curve(1)} fill="none" stroke="#9ca3af" strokeWidth="2" />
          <path d={curve(sdAfter)} fill="none" stroke="#2ab8eb" strokeWidth="2" />
          <text x={RW - RP} y={28} fill="#9ca3af" fontSize="10" textAnchor="end">до</text>
          <text x={RW - RP} y={42} fill="#2ab8eb" fontSize="10" textAnchor="end">после (уже)</text>
        </svg>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#2ab8eb]">дисперсия −{(reduction * 100).toFixed(0)}%</span>
        <span className="text-gray-700">эквивалентно ×{nFactor.toFixed(1)} к объёму данных</span>
        <span className="text-gray-500">нужно ~{(100 * (1 - reduction)).toFixed(0)}% прежней выборки</span>
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Корреляция ковариата с метрикой ρ</span><span className="tabular-nums text-cyanink">{rho.toFixed(2)}</span></div>
        <input type="range" min="0" max="0.95" step="0.05" value={rho} onChange={(e) => setRho(Number(e.target.value))} className="w-full accent-accent" />
      </label>
      <p className="text-xs text-gray-500 mt-2">Чем сильнее ковариат предсказывает метрику (выше ρ), тем больше дисперсии убирается (на (1−ρ²)) и тем чувствительнее тест при том же n.</p>
    </div>
  )
}
