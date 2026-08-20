import { useState } from 'react'
import { makeSeries, trailingAverage, expSmoothing, holtWinters, mape, SEASON } from '../lib/timeseries.js'

// Модуль 8, урок 4. Скользящее среднее, экспоненциальное сглаживание и
// Хольт — Уинтерс на одном ряду. Последние 14 дней спрятаны от методов и
// показаны серым: прогноз строится только по прошлому, а MAPE считается на
// том, чего метод не видел. Панель весов справа объясняет α наглядно —
// столбики показывают, какую долю ответа даёт каждое прошлое наблюдение.
const W = 560
const H = 208
const PAD_L = 34
const N = 84
const HOLD = 14 // сколько дней прячем

const METHODS = {
  ma: { color: '#7c9c3f', ru: 'скользящее среднее', en: 'moving average' },
  es: { color: '#2ab8eb', ru: 'экспоненциальное сглаживание', en: 'exponential smoothing' },
  hw: { color: '#a86ec4', ru: 'Хольт — Уинтерс', en: 'Holt–Winters' },
}

export default function SmoothingForecast({ locale = 'ru', method: initial = 'ma' }) {
  const en = locale === 'en'
  const [method, setMethod] = useState(initial)
  const [win, setWin] = useState(7)
  const [alpha, setAlpha] = useState(0.3)

  const s = makeSeries({ n: N, trend: 0.45, seasonAmp: 14, noise: 4, seed: 7 })
  const cut = N - HOLD
  const train = s.y.slice(0, cut)
  const test = s.y.slice(cut)

  // подгонка по обучающей части + прогноз на спрятанные дни
  let fitted = []
  let forecast = []
  if (method === 'ma') {
    // именно скользящее среднее ПО ПРОШЛОМУ: центрированное окно заглядывало
    // бы вперёд, и линия не стыковалась бы с прогнозом на её конце
    fitted = trailingAverage(train, win)
    const last = train.slice(-win).reduce((a, b) => a + b, 0) / win
    forecast = Array(HOLD).fill(last) // среднее последних дней, дальше — прямая
  } else if (method === 'es') {
    fitted = expSmoothing(train, alpha)
    const level = fitted[fitted.length - 1]
    forecast = Array(HOLD).fill(level)
  } else {
    const hw = holtWinters(train, { alpha, period: SEASON })
    fitted = hw.fitted
    forecast = Array.from({ length: HOLD }, (_, h) => hw.forecast(h + 1))
  }
  const err = mape(test, forecast)

  const all = [...s.y, ...forecast]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const SER_W = 396
  const sx = (i) => PAD_L + (i / (N - 1)) * (SER_W - PAD_L)
  const sy = (v) => 176 - ((v - lo) / (hi - lo || 1)) * 150

  const color = METHODS[method].color

  // веса прошлых наблюдений: у ES они падают как (1−α)^k, у скользящего
  // среднего одинаковы внутри окна и равны нулю за ним
  const weights = Array.from({ length: 16 }, (_, k) =>
    method === 'ma' ? (k < win ? 1 / win : 0) : alpha * (1 - alpha) ** k,
  )
  const wMax = Math.max(...weights) || 1

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* граница «видно / спрятано» */}
        <line x1={sx(cut - 1)} y1={18} x2={sx(cut - 1)} y2={182} stroke="#d6cebf" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={sx(cut - 1) - 4} y={14} fill="#9a907c" fontSize="9.5" textAnchor="end">{en ? 'known' : 'известно'}</text>
        <text x={sx(cut - 1) + 4} y={14} fill="#9a907c" fontSize="9.5">{en ? 'hidden' : 'спрятано'}</text>

        {/* факт: обучающая часть тёмная, спрятанная — серая */}
        <path d={train.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" />
        <path d={test.map((v, i) => `${i ? 'L' : 'M'}${sx(cut + i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" opacity="0.3" />

        {/* сглаженная линия и прогноз */}
        <path d={fitted.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke={color} strokeWidth="2" />
        <path
          d={[fitted[fitted.length - 1], ...forecast]
            .map((v, i) => `${i ? 'L' : 'M'}${sx(cut - 1 + i).toFixed(1)},${sy(v).toFixed(1)}`)
            .join(' ')}
          fill="none" stroke={color} strokeWidth="2" strokeDasharray="5 4"
        />
        <text x={4} y={30} fill="#9a907c" fontSize="9">{Math.round(hi)}</text>
        <text x={4} y={176} fill="#9a907c" fontSize="9">{Math.round(lo)}</text>
        <text x={SER_W - 4} y={196} fill="#9a907c" fontSize="10" textAnchor="end">{en ? 'days →' : 'дни →'}</text>

        {/* панель весов */}
        <text x={418} y={14} fill="#9a907c" fontSize="10">
          {en ? 'weight of past days' : 'вес прошлых дней'}
        </text>
        {weights.map((w, k) => (
          <rect
            key={k}
            x={418 + k * 8.6}
            y={100 - (w / wMax) * 74}
            width="6.4"
            height={Math.max(0.6, (w / wMax) * 74)}
            fill={color}
            opacity={w ? 0.85 : 0.15}
          />
        ))}
        <line x1={418} y1={100} x2={W - 4} y2={100} stroke="#d6cebf" strokeWidth="1" />
        <text x={418} y={114} fill="#9a907c" fontSize="9">{en ? 'yesterday' : 'вчера'}</text>
        <text x={W - 4} y={114} fill="#9a907c" fontSize="9" textAnchor="end">{en ? '16 days ago' : '16 дней назад'}</text>
        <text x={418} y={140} fill="#9a907c" fontSize="9.5">
          {method === 'ma'
            ? en ? `each of ${win} days: ${(1 / win).toFixed(2)}` : `каждый из ${win} дней: ${(1 / win).toFixed(2)}`
            : en ? `yesterday: ${alpha.toFixed(2)}, then ×${(1 - alpha).toFixed(2)}` : `вчера: ${alpha.toFixed(2)}, дальше ×${(1 - alpha).toFixed(2)}`}
        </text>
        <text x={418} y={162} fill={color} fontSize="11">
          MAPE = {isNaN(err) ? '—' : `${err.toFixed(1)}%`}
        </text>
        <text x={418} y={178} fill="#9a907c" fontSize="9">{en ? 'on the hidden days' : 'на спрятанных днях'}</text>
      </svg>

      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {Object.entries(METHODS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setMethod(k)}
            className={`text-xs px-2.5 py-1 rounded-md border ${
              method === k ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            {en ? v.en : v.ru}
          </button>
        ))}
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-x-5 gap-y-2 text-xs text-gray-700">
        <label className={`flex flex-col gap-1 ${method === 'ma' ? '' : 'opacity-40'}`}>
          <span>{en ? 'window' : 'окно'} = {win} {en ? 'days' : 'дней'}</span>
          <input type="range" min="2" max="21" step="1" value={win} disabled={method !== 'ma'} onChange={(e) => setWin(+e.target.value)} className="accent-cyanink" />
        </label>
        <label className={`flex flex-col gap-1 ${method === 'ma' ? 'opacity-40' : ''}`}>
          <span>α = {alpha.toFixed(2)}</span>
          <input type="range" min="0.05" max="0.95" step="0.05" value={alpha} disabled={method === 'ma'} onChange={(e) => setAlpha(+e.target.value)} className="accent-cyanink" />
        </label>
      </div>

      <p className="text-xs text-gray-500 mt-2 max-w-[62ch]">
        {en
          ? 'Moving average and simple smoothing forecast a flat line: they carry no trend or seasonality. Holt–Winters keeps all three components, so its forecast keeps the weekly shape.'
          : 'Скользящее среднее и простое сглаживание прогнозируют прямой линией: ни тренда, ни сезонности они не хранят. Хольт — Уинтерс держит все три компоненты, поэтому его прогноз сохраняет недельную форму.'}
      </p>
    </div>
  )
}
