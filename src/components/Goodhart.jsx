import { useState } from 'react'

// Закон Гудхарта: когда метрика становится целью, её начинают «гейлить» —
// и реальная ценность падает, хотя метрика растёт.
const W = 440
const H = 180
const PAD = 30

export default function Goodhart() {
  const [push, setPush] = useState(0.2) // насколько давим на метрику
  const metric = push // целевая метрика растёт прямо с давлением
  const value = Math.max(0, 1 - Math.max(0, push - 0.4) * 1.7) // ценность падает после перегиба

  const barY = 50
  const bar = (y, frac, color, label) => {
    const full = W - 2 * PAD - 120
    return (
      <g>
        <text x={PAD} y={y + 4} fill="#374151" fontSize="11">{label}</text>
        <rect x={PAD + 120} y={y - 10} width={full} height={18} rx="3" fill="#ffffff" opacity="0.06" />
        <rect x={PAD + 120} y={y - 10} width={full * frac} height={18} rx="3" fill={color} opacity="0.8" />
      </g>
    )
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {bar(barY, metric, '#2ab8eb', 'Целевая метрика')}
        {bar(barY + 50, value, '#fbbf24', 'Реальная ценность')}
        <text x={PAD} y={H - 14} fill="#6b7280" fontSize="10">Напр.: «звонков в час» ↑, а качество разговора ↓</text>
      </svg>

      <div className="mt-1 text-sm text-gray-600">
        {push < 0.4
          ? 'Пока давление умеренное, метрика и ценность растут вместе.'
          : 'Метрику накручивают любой ценой — и реальная ценность проваливается.'}
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Давление на метрику</span><span className="text-cyanink">{(push * 100).toFixed(0)}%</span></div>
        <input type="range" min="0" max="1" step="0.05" value={push} onChange={(e) => setPush(Number(e.target.value))} className="w-full accent-accent" />
      </label>
    </div>
  )
}
