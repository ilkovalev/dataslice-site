import { useState } from 'react'

// Две кривые: H0 (эффекта нет) и H1 (эффект есть). Порог делит «объявляем
// эффект / нет». α — площадь H0 правее порога (ложное срабатывание), β — площадь
// H1 левее порога (пропуск). Больше n — кривые уже, ошибки меньше.
const W = 640
const H = 230
const PAD = 36
const BASE = H - PAD
const DMIN = -10
const DMAX = 14
const N = 240

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (x, mu, s) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)))
const pdf = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))

export default function HypothesisTest() {
  const [thr, setThr] = useState(2)
  const [n, setN] = useState(36)
  const [effect, setEffect] = useState(4) // истинная разница (μ при H1)
  const [sd, setSd] = useState(14) // разброс данных σ
  const EFFECT = effect
  const sigma = sd / Math.sqrt(n)

  const sx = (x) => PAD + ((x - DMIN) / (DMAX - DMIN)) * (W - 2 * PAD)
  const yMax = pdf(0, 0, sigma)
  const sy = (y) => BASE - (y / yMax) * (H - 2 * PAD)

  const curve = (mu) => {
    let dd = ''
    for (let i = 0; i <= N; i++) {
      const x = DMIN + ((DMAX - DMIN) * i) / N
      dd += `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(pdf(x, mu, sigma)).toFixed(1)} `
    }
    return dd
  }
  // площадь под кривой mu на интервале [a,b] как заливка
  const area = (mu, a, b) => {
    let dd = `M${sx(a).toFixed(1)},${BASE} `
    const steps = 80
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps
      dd += `L${sx(x).toFixed(1)},${sy(pdf(x, mu, sigma)).toFixed(1)} `
    }
    dd += `L${sx(b).toFixed(1)},${BASE} Z`
    return dd
  }

  const alpha = 1 - cdf(thr, 0, sigma) // ложное срабатывание
  const beta = cdf(thr, EFFECT, sigma) // пропуск
  const power = 1 - beta

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <path d={area(0, thr, DMAX)} fill="#fbbf24" opacity="0.25" />
        <path d={area(EFFECT, DMIN, thr)} fill="#f87171" opacity="0.2" />
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={curve(0)} fill="none" stroke="#6b7280" strokeWidth="2" />
        <path d={curve(EFFECT)} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        <line x1={sx(thr)} y1={PAD - 6} x2={sx(thr)} y2={BASE} stroke="#2a2f3a" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(0)} y={PAD - 8} fill="#6b7280" fontSize="10" textAnchor="middle">H0: эффекта нет</text>
        <text x={sx(EFFECT)} y={PAD - 8} fill="#2ab8eb" fontSize="10" textAnchor="middle">H1: эффект есть</text>
        <text x={sx(thr)} y={BASE + 14} fill="#2a2f3a" fontSize="10" textAnchor="middle">порог</text>
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-[#fbbf24]">Ошибка 1 рода α (ложное срабатывание): {(alpha * 100).toFixed(1)}%</span>
        <span className="text-[#f87171]">Ошибка 2 рода β (пропуск): {(beta * 100).toFixed(1)}%</span>
        <span className="text-[#2ab8eb]">Мощность (1−β): {(power * 100).toFixed(1)}%</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Порог решения</span><span className="tabular-nums text-cyanink">{thr.toFixed(1)}</span></div>
          <input type="range" min="-2" max="10" step="0.1" value={thr} onChange={(e) => setThr(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Размер выборки n</span><span className="tabular-nums text-cyanink">{n}</span></div>
          <input type="range" min="4" max="120" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Истинный эффект (разница средних)</span><span className="tabular-nums text-cyanink">{effect.toFixed(1)}</span></div>
          <input type="range" min="0" max="8" step="0.2" value={effect} onChange={(e) => setEffect(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>Разброс данных σ</span><span className="tabular-nums text-cyanink">{sd}</span></div>
          <input type="range" min="6" max="26" step="1" value={sd} onChange={(e) => setSd(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">Эффект ↑ или σ ↓ — кривые расходятся, обе ошибки падают. n ↑ — кривые сужаются (σ/√n), различить миры легче.</p>
    </div>
  )
}
