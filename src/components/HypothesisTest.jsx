import { useState } from 'react'

// Дизайн-картинка теста. H0 (эффекта нет, центр 0) и H1 (эффект есть, центр = δ
// — минимальный эффект MDE, который хотим уметь ловить). Управляем α и видом теста —
// критическое значение из них ВЫЧИСЛЯЕТСЯ (crit = z·SE). β и мощность следуют из
// α, MDE, n и σ. Порог не крутят вручную; мощность поднимают размером выборки.
//
// Единицы честные: метрика — средний чек в рублях (базовое среднее MU). σ и
// критическое значение живут в рублях (единицах метрики), MDE — относительный
// прирост в %, α/β/мощность — вероятности в %. Ось X — отклонение среднего, ₽.
const MU = 1000 // базовое среднее метрики, ₽ («средний чек»)
const EFFECT = 60 // фиксированный истинный эффект (центр H1), ₽ — колокол H1 не двигается
const W = 640
const H = 230
const PAD = 36
const BASE = H - PAD
const DMIN = -100
const DMAX = 140
const N = 240

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (x, mu, s) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)))
const pdf = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))
function ndtri(p) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const pl = 0.02425
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1) }
  if (p <= 1 - pl) { const q = p - 0.5; const r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1) }
  const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

export default function HypothesisTest() {
  const [alpha, setAlpha] = useState(0.05)
  const [twoSided, setTwoSided] = useState(false)
  const [n, setN] = useState(36)
  const [sd, setSd] = useState(200) // σ — стандартное отклонение метрики, ₽
  const sigma = sd / Math.sqrt(n) // SE — стандартная ошибка среднего, ₽
  // Истинный эффект (центр H1) ФИКСИРОВАН: распределения не двигаются. По теории
  // порог решения зависит только от H0 и α, а не от эффекта, — поэтому в уроке
  // про две ошибки двигаем именно порог (через α), а колокола стоят на месте.
  const delta = EFFECT // абсолютный истинный эффект (центр H1), ₽

  // критическое значение ВЫЧИСЛЯЕТСЯ из α и вида теста, в рублях
  const z = ndtri(1 - (twoSided ? alpha / 2 : alpha))
  const crit = sigma * z

  const sx = (x) => PAD + ((x - DMIN) / (DMAX - DMIN)) * (W - 2 * PAD)
  const yMax = pdf(0, 0, sigma)
  const sy = (y) => BASE - (y / yMax) * (H - 2 * PAD)
  const curve = (mu) => {
    let dd = ''
    for (let i = 0; i <= N; i++) { const x = DMIN + ((DMAX - DMIN) * i) / N; dd += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(pdf(x, mu, sigma)).toFixed(1)} ` }
    return dd
  }
  const area = (mu, a, bb) => {
    let dd = `M${sx(a).toFixed(1)},${BASE} `
    const steps = 70
    for (let i = 0; i <= steps; i++) { const x = a + ((bb - a) * i) / steps; dd += `L${sx(x).toFixed(1)},${sy(pdf(x, mu, sigma)).toFixed(1)} ` }
    dd += `L${sx(bb).toFixed(1)},${BASE} Z`
    return dd
  }

  const beta = twoSided ? cdf(crit, delta, sigma) - cdf(-crit, delta, sigma) : cdf(crit, delta, sigma)
  const power = 1 - beta
  const nFor80 = () => {
    const zb = ndtri(0.8)
    const need = (sd * (z + zb) / Math.max(1, delta)) ** 2
    setN(clamp(Math.round(need), 4, 500))
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <path d={area(0, crit, DMAX)} fill="#fbbf24" opacity="0.28" />
        {twoSided && <path d={area(0, DMIN, -crit)} fill="#fbbf24" opacity="0.28" />}
        <path d={area(delta, twoSided ? -crit : DMIN, crit)} fill="#f87171" opacity="0.22" />
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={curve(0)} fill="none" stroke="#6b7280" strokeWidth="2" />
        <path d={curve(delta)} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        <line x1={sx(crit)} y1={PAD - 6} x2={sx(crit)} y2={BASE} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        {twoSided && <line x1={sx(-crit)} y1={PAD - 6} x2={sx(-crit)} y2={BASE} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />}
        <text x={sx(0)} y={PAD - 8} fill="#6b7280" fontSize="10" textAnchor="middle">H0: эффекта нет</text>
        <text x={sx(delta)} y={PAD - 8} fill="#2ab8eb" fontSize="10" textAnchor="middle">H1: истинный эффект = +{Math.round(delta)} ₽</text>
        <text x={sx(crit)} y={BASE + 14} fill="#2a2f3a" fontSize="10" textAnchor="middle">критич. значение</text>
        <text x={sx((crit + DMAX) / 2)} y={BASE - 6} fill="#c69214" fontSize="9" textAnchor="middle">α</text>
        <text x={sx((crit + delta) / 2)} y={BASE - 6} fill="#dc4d4d" fontSize="9" textAnchor="middle">β</text>
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-gray-700">критич. значение = {twoSided ? '±' : ''}{crit.toFixed(0)} ₽ (расчётное)</span>
        <span className="text-[#d9a300]">α (ложное срабатывание): {(alpha * 100).toFixed(0)}%</span>
        <span className="text-[#f87171]">β (пропуск): {(beta * 100).toFixed(1)}%</span>
        <span className="text-[#2ab8eb]">Мощность (1−β): {(power * 100).toFixed(1)}%</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Оба колокола — выборочные распределения оценки (разницы средних), они <b>неподвижны</b>: серый H0 всегда центрирован на 0, синий H1 — на истинном эффекте (+{Math.round(delta)} ₽). Двигается только <b>порог</b>: критическое значение зависит лишь от H0 и α (crit = z·SE, SE = σ/√n), а не от эффекта. Меняя α, вы двигаете порог и видите баланс двух ошибок: жёлтая площадь — α (ошибка 1 рода), красная — β (пропуск эффекта). n и σ меняют только ширину колоколов. Сколько нужно наблюдений под нужный эффект — в следующем уроке про размер выборки.</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs text-gray-600 mr-1">Вид теста:</span>
        <button onClick={() => setTwoSided(false)} className={`text-xs px-2.5 py-1 rounded border ${!twoSided ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>односторонний</button>
        <button onClick={() => setTwoSided(true)} className={`text-xs px-2.5 py-1 rounded border ${twoSided ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>двусторонний</button>
        <button onClick={nFor80} className="text-xs px-3 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10 whitespace-nowrap sm:ml-auto">↳ подобрать n для мощности 80%</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3 mt-3 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Уровень значимости α</span><span className="tabular-nums text-cyanink">{(alpha * 100).toFixed(0)}%</span></div>
          <input type="range" min="0.01" max="0.2" step="0.01" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Размер выборки n</span><span className="tabular-nums text-cyanink">{n}</span></div>
          <input type="range" min="4" max="500" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>σ — стандартное отклонение метрики</span><span className="tabular-nums text-cyanink">{sd} ₽</span></div>
          <input type="range" min="60" max="320" step="10" value={sd} onChange={(e) => setSd(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">Метрика — средний чек, {MU} ₽; истинный эффект фиксирован (+{Math.round(delta)} ₽), колокола не двигаются. α задаёт критическое значение (выше α — порог ближе к нулю, α растёт, а β падает — вот он, баланс двух ошибок). Мощность (1−β) поднимают НЕ порогом, а размером выборки n или меньшим σ — они сужают колокола, не сдвигая их центры; кнопка подбирает n под мощность 80%. Двусторонний тест ловит отклонение в любую сторону, поэтому при той же α его порог дальше от нуля.</p>
    </div>
  )
}
