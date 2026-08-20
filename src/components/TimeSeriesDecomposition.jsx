import { useState } from 'react'
import { makeSeries, movingAverage, SEASON } from '../lib/timeseries.js'

// Модуль 8, урок 1. Ряд продаж = тренд + сезонность + остаток.
// Ползунки задают ИСТИННЫЕ компоненты, из которых ряд собран, поэтому
// разложение можно показать честно: сверху то, что видно на дашборде, ниже —
// три слагаемых по отдельности. Кнопка «разложить» раскрывает панели.
const W = 560
const ROW = 82
const PAD_L = 34
const PAD_R = 10
const N = 84

const COLORS = { data: '#2a2f3a', trend: '#2ab8eb', season: '#7c9c3f', noise: '#fbbf24' }

export default function TimeSeriesDecomposition({ highlight, locale = 'ru' }) {
  const en = locale === 'en'
  const [trend, setTrend] = useState(0.45)
  const [seasonAmp, setSeasonAmp] = useState(14)
  const [noise, setNoise] = useState(4)
  const [split, setSplit] = useState(false)

  const s = makeSeries({ n: N, trend, seasonAmp, noise, seed: 7 })
  // Оценка тренда скользящим средним по длине цикла: именно так его достают
  // из реального ряда, где истинных компонент никто не показывает.
  const estTrend = movingAverage(s.y, SEASON)

  const rows = split
    ? [
        { key: 'data', label: en ? 'what the dashboard shows' : 'что видно на дашборде', values: s.y, color: COLORS.data, extra: estTrend },
        { key: 'trend', label: en ? 'trend' : 'тренд', values: s.trend, color: COLORS.trend },
        { key: 'season', label: en ? 'seasonality' : 'сезонность', values: s.season, color: COLORS.season },
        { key: 'noise', label: en ? 'residual (noise)' : 'остаток (шум)', values: s.noise, color: COLORS.noise },
      ]
    : [{ key: 'data', label: en ? 'what the dashboard shows' : 'что видно на дашборде', values: s.y, color: COLORS.data, extra: estTrend }]

  const H = rows.length * ROW + 22

  const path = (values, top, lo, hi) => {
    const w = W - PAD_L - PAD_R
    const span = hi - lo || 1
    return values
      .map((v, i) => {
        const x = PAD_L + (i / (N - 1)) * w
        const y = top + ROW - 26 - ((v - lo) / span) * (ROW - 38)
        return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {rows.map((r, ri) => {
          const top = ri * ROW + 6
          const all = r.extra ? [...r.values, ...r.extra] : r.values
          const lo = Math.min(...all)
          const hi = Math.max(...all)
          const dim = highlight && highlight !== r.key && r.key !== 'data'
          return (
            <g key={r.key} opacity={dim ? 0.25 : 1}>
              <text x={PAD_L} y={top + 12} fill="#9a907c" fontSize="10.5">{r.label}</text>
              {/* нулевая линия у центрированных компонент: без неё не видно,
                  что сезонность и остаток колеблются вокруг нуля */}
              {(r.key === 'season' || r.key === 'noise') && (
                <line
                  x1={PAD_L} x2={W - PAD_R}
                  y1={top + ROW - 26 - ((0 - lo) / (hi - lo || 1)) * (ROW - 38)}
                  y2={top + ROW - 26 - ((0 - lo) / (hi - lo || 1)) * (ROW - 38)}
                  stroke="#d6cebf" strokeWidth="1" strokeDasharray="3 3"
                />
              )}
              <path d={path(r.values, top, lo, hi)} fill="none" stroke={r.color} strokeWidth={r.key === 'data' ? 1.2 : 1.1} />
              {r.extra && (
                <path d={path(r.extra, top, lo, hi)} fill="none" stroke={COLORS.trend} strokeWidth="1.5" opacity="0.85" />
              )}
              {/* подписи шкалы прижаты к своим краям панели: рядом друг с другом
                  они читались как одно двузначное число */}
              <text x={4} y={top + 20} fill="#9a907c" fontSize="9">{Math.round(hi)}</text>
              <text x={4} y={top + ROW - 22} fill="#9a907c" fontSize="9">{Math.round(lo)}</text>
            </g>
          )
        })}
        <text x={W - PAD_R} y={H - 4} fill="#9a907c" fontSize="10" textAnchor="end">
          {en ? 'days →' : 'дни →'}
        </text>
      </svg>

      <div className="mt-3 grid sm:grid-cols-3 gap-x-5 gap-y-2 text-xs text-gray-700">
        <label className="flex flex-col gap-1">
          <span style={{ color: COLORS.trend }}>{en ? 'trend' : 'тренд'}: {trend.toFixed(2)} {en ? '/day' : '/день'}</span>
          <input type="range" min="0" max="1.2" step="0.05" value={trend} onChange={(e) => setTrend(+e.target.value)} className="accent-cyanink" />
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ color: COLORS.season }}>{en ? 'seasonality' : 'сезонность'}: ±{seasonAmp}</span>
          <input type="range" min="0" max="28" step="1" value={seasonAmp} onChange={(e) => setSeasonAmp(+e.target.value)} className="accent-cyanink" />
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ color: '#d9a300' }}>{en ? 'noise' : 'шум'}: {noise}</span>
          <input type="range" min="0" max="14" step="1" value={noise} onChange={(e) => setNoise(+e.target.value)} className="accent-cyanink" />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <p className="text-xs text-gray-500 max-w-[46ch]">
          {en
            ? 'The top line is the sum of the three below it. The cyan line on it is the trend estimated by a 7-day moving average.'
            : 'Верхняя линия — сумма трёх нижних. Бирюзовая поверх неё — тренд, оценённый скользящим средним по 7 дням.'}
        </p>
        <button
          onClick={() => setSplit((v) => !v)}
          className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5"
        >
          {split ? (en ? 'collapse back' : 'собрать обратно') : (en ? 'decompose' : 'разложить')}
        </button>
      </div>
    </div>
  )
}
