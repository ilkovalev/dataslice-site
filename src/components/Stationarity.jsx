import { useState } from 'react'
import { makeSeries, diff, trailingAverage, SEASON } from '../lib/timeseries.js'

// Модуль 8, урок 3. Стационарность на глаз: под рядом идут два «датчика» —
// скользящее среднее и скользящий разброс. Пока ряд растёт, среднее ползёт
// вверх; кнопки дифференцирования переводят ряд к приростам, и линия
// выравнивается. Вердикт считается по тем же двум числам, а не декларируется.
const W = 560
const H = 250
const PAD_L = 34
const N = 90
const WIN = 14 // окно датчиков

function rollingStd(y, w) {
  const out = []
  for (let i = 0; i < y.length; i++) {
    const from = Math.max(0, i - w + 1)
    const s = y.slice(from, i + 1)
    const m = s.reduce((a, b) => a + b, 0) / s.length
    out.push(Math.sqrt(s.reduce((a, v) => a + (v - m) ** 2, 0) / s.length))
  }
  return out
}

// «Плывёт ли» линия: сравниваем средние первой и последней трети с общим
// разбросом ряда. Порог 0.5σ — грубый, но честный и одинаковый для обеих полос.
function drifts(line, spread) {
  const k = Math.floor(line.length / 3)
  const head = line.slice(WIN, WIN + k)
  const tail = line.slice(-k)
  const mean = (a) => a.reduce((x, b) => x + b, 0) / a.length
  return Math.abs(mean(tail) - mean(head)) > 0.5 * spread
}

export default function Stationarity({ locale = 'ru' }) {
  const en = locale === 'en'
  const [d, setD] = useState(0) // обычных дифференцирований: 0, 1, 2
  const [seasonal, setSeasonal] = useState(false)

  const base = makeSeries({ n: N, trend: 0.6, seasonAmp: 13, noise: 4, seed: 5 })
  let y = base.y
  let label = en ? 'raw series: daily revenue' : 'исходный ряд: выручка по дням'
  if (seasonal) {
    y = diff(y, SEASON)
    label = en ? `seasonal difference (lag ${SEASON})` : `сезонная разность (лаг ${SEASON})`
  }
  for (let i = 0; i < d; i++) y = diff(y, 1)
  if (d > 0) {
    const inc = en ? `${d === 1 ? 'first' : 'second'} difference` : `${d === 1 ? 'первая' : 'вторая'} разность`
    label = seasonal ? `${label} + ${inc}` : en ? `${inc}: day-over-day change` : `${inc}: прирост день ко дню`
  }

  const mean = trailingAverage(y, WIN)
  const sd = rollingStd(y, WIN)
  const overall = Math.sqrt(
    y.reduce((a, v) => a + (v - y.reduce((x, b) => x + b, 0) / y.length) ** 2, 0) / y.length,
  )
  const meanDrifts = drifts(mean, overall)
  const sdDrifts = drifts(sd, overall)
  const stationary = !meanDrifts && !sdDrifts

  const n = y.length
  const lo = Math.min(...y)
  const hi = Math.max(...y)
  const sx = (i) => PAD_L + (i / (n - 1)) * (W - PAD_L - 12)
  const sy = (v) => 128 - ((v - lo) / (hi - lo || 1)) * 104

  // датчики: обе линии в одной панели, каждая в своей шкале — важна форма,
  // а не абсолютный уровень
  const gauge = (values, top, height, color, name) => {
    const glo = Math.min(...values.slice(WIN))
    const ghi = Math.max(...values.slice(WIN))
    const gy = (v) => top + height - ((v - glo) / (ghi - glo || 1)) * (height - 6)
    return (
      <g>
        <text x={PAD_L} y={top - 2} fill="#9a907c" fontSize="9.5">{name}</text>
        <path
          d={values.map((v, i) => (i < WIN ? '' : `${i === WIN ? 'M' : 'L'}${sx(i).toFixed(1)},${gy(v).toFixed(1)}`)).join(' ')}
          fill="none" stroke={color} strokeWidth="1.8"
        />
      </g>
    )
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <text x={PAD_L} y={14} fill="#9a907c" fontSize="10.5">{label}</text>
        {/* нулевая линия нужна только у разностей: там важно, колеблется ли ряд вокруг нуля */}
        {(d > 0 || seasonal) && lo < 0 && hi > 0 && (
          <line x1={PAD_L} y1={sy(0)} x2={W - 12} y2={sy(0)} stroke="#d6cebf" strokeWidth="1" strokeDasharray="3 3" />
        )}
        <path d={y.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" />
        <text x={4} y={30} fill="#9a907c" fontSize="9">{Math.round(hi)}</text>
        <text x={4} y={128} fill="#9a907c" fontSize="9">{Math.round(lo)}</text>

        {gauge(mean, 158, 34, meanDrifts ? '#e0575b' : '#7c9c3f', en ? `rolling mean (${WIN} days)` : `скользящее среднее (${WIN} дней)`)}
        {gauge(sd, 214, 30, sdDrifts ? '#e0575b' : '#7c9c3f', en ? `rolling spread (${WIN} days)` : `скользящий разброс (${WIN} дней)`)}
      </svg>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {[0, 1, 2].map((k) => (
          <button
            key={k}
            onClick={() => setD(k)}
            className={`text-xs px-2.5 py-1 rounded-md border ${
              d === k ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            d = {k}
          </button>
        ))}
        <button
          onClick={() => setSeasonal((v) => !v)}
          className={`text-xs px-2.5 py-1 rounded-md border ${
            seasonal ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
          }`}
        >
          {en ? `seasonal difference (${SEASON})` : `сезонная разность (${SEASON})`}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span className={stationary ? 'text-[#5f7a2e]' : 'text-[#c04a4e]'}>
          {stationary
            ? en ? '✓ mean and spread hold steady' : '✓ среднее и разброс держатся на месте'
            : en ? '✗ mean or spread drifts over time' : '✗ среднее или разброс плывут со временем'}
        </span>
        <span className="text-gray-500">
          {en ? 'differences taken' : 'взято разностей'}: d = {d}{seasonal ? ` + ${en ? 'seasonal' : 'сезонная'}` : ''}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2 max-w-[62ch]">
        {en
          ? 'Differencing subtracts the previous value from each one. It removes the trend — but every extra difference eats one observation and amplifies noise.'
          : 'Дифференцирование вычитает из каждого значения предыдущее. Тренд уходит — но каждая лишняя разность съедает одно наблюдение и раздувает шум.'}
      </p>
    </div>
  )
}
