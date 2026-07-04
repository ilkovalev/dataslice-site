import { useState } from 'react'

// Дуальность оценивания и проверки: доверительный интервал оценки относительно
// нуля. Интервал не накрыл ноль ⟺ p < 0.05. И видно разницу «значимо, но мелко»
// против «не значимо, потому что широко».
const W = 520
const H = 150
const PAD = 40

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

export default function CIvsP({ locale = 'ru' }) {
  const en = locale === 'en'
  const [effect, setEffect] = useState(2.0) // наблюдаемая разница (п.п.)
  const [n, setN] = useState(1000)

  const se = 40 / Math.sqrt(n) // условная стандартная ошибка
  const lo = effect - 1.96 * se
  const hi = effect + 1.96 * se
  const z = effect / se
  const p = 2 * (1 - Phi(Math.abs(z)))
  const sig = lo > 0 || hi < 0

  const dmax = 8
  const sx = (v) => W / 2 + (v / dmax) * (W / 2 - PAD)
  const y = H / 2

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={sx(0)} y1={20} x2={sx(0)} y2={H - 30} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(0)} y={16} fill="#2a2f3a" fontSize="10" textAnchor="middle">{en ? 'zero (no effect)' : 'ноль (нет эффекта)'}</text>
        <line x1={sx(lo)} y1={y} x2={sx(hi)} y2={y} stroke={sig ? '#16a34a' : '#dc4d4d'} strokeWidth="4" />
        <line x1={sx(lo)} y1={y - 8} x2={sx(lo)} y2={y + 8} stroke={sig ? '#16a34a' : '#dc4d4d'} strokeWidth="2.5" />
        <line x1={sx(hi)} y1={y - 8} x2={sx(hi)} y2={y + 8} stroke={sig ? '#16a34a' : '#dc4d4d'} strokeWidth="2.5" />
        <circle cx={sx(effect)} cy={y} r="4.5" fill={sig ? '#16a34a' : '#dc4d4d'} />
        <text x={sx(effect)} y={y - 12} fill="#2a2f3a" fontSize="11" textAnchor="middle">{effect.toFixed(1)} {en ? 'pp' : 'п.п.'}</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-gray-700">{en ? '95% CI' : '95% ДИ'}: [{lo.toFixed(1)}; {hi.toFixed(1)}]</span>
        <span className={sig ? 'text-green-600' : 'text-[#dc4d4d]'}>{sig ? (en ? 'excludes zero → p < 0.05 (significant)' : 'не накрывает ноль → p < 0.05 (значимо)') : (en ? 'covers zero → p ≥ 0.05 (not significant)' : 'накрывает ноль → p ≥ 0.05 (не значимо)')}</span>
        <span className="text-gray-500">p ≈ {p < 0.001 ? '<0.001' : p.toFixed(3)}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Observed effect' : 'Наблюдаемый эффект'}</span><span className="text-cyanink">{effect.toFixed(1)} {en ? 'pp' : 'п.п.'}</span></div>
          <input type="range" min="0" max="6" step="0.1" value={effect} onChange={(e) => setEffect(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Sample size n' : 'Размер выборки n'}</span><span className="text-cyanink">{n}</span></div>
          <input type="range" min="100" max="8000" step="100" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en ? 'The interval excludes zero ⟺ the test is significant (p<0.05) — one and the same statement. But the interval says more: at huge n even a tiny effect is "significant", yet the interval shows it is small; at small n the interval is wide — "data is scarce", not "there is no effect".' : 'Интервал не накрыл ноль ⟺ тест значим (p<0.05) — это одно и то же утверждение. Но интервал говорит больше: при огромном n даже крошечный эффект «значим», зато интервал покажет, что он мал; при малом n интервал широкий — «данных мало», а не «эффекта нет».'}</p>
    </div>
  )
}
