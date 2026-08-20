import { useState } from 'react'
import { makeSeries, acf, acfBand } from '../lib/timeseries.js'

// Модуль 8, урок 2. Автокорреляция: ряд коррелирует сам с собой, сдвинутым
// на лаг k. Три поверхности сразу — ряд с выделенными парами (t, t−k),
// диаграмма рассеяния этих пар и коррелограмма по всем лагам.
// Переключатель формы ряда показывает, чем отличается «след» тренда от следа
// сезонности: у первого ACF затухает медленно, у второй — гребёнка через 7.
const W = 560
const H = 300
const N = 70
const MAXLAG = 21

const KINDS = {
  noise: { trend: 0, seasonAmp: 0, noise: 9, ru: 'только шум', en: 'pure noise' },
  trend: { trend: 0.7, seasonAmp: 0, noise: 5, ru: 'тренд', en: 'trend' },
  season: { trend: 0, seasonAmp: 16, noise: 4, ru: 'сезонность', en: 'seasonality' },
  real: { trend: 0.45, seasonAmp: 14, noise: 4, ru: 'как в жизни', en: 'real-world mix' },
}

export default function Autocorrelation({ locale = 'ru', kind: initialKind = 'real' }) {
  const en = locale === 'en'
  const [kind, setKind] = useState(initialKind)
  const [lag, setLag] = useState(1)

  const s = makeSeries({ n: N, seed: 11, ...KINDS[kind] })
  const y = s.y
  const r = acf(y, MAXLAG)
  const band = acfBand(N)

  // пары (y[t−k], y[t]) — то, что коррелограмма сворачивает в одно число
  const pairs = y.slice(lag).map((v, i) => ({ x: y[i], y: v }))

  const lo = Math.min(...y)
  const hi = Math.max(...y)
  const SER_W = 340
  const sx = (i) => 32 + (i / (N - 1)) * (SER_W - 40)
  const sy = (v) => 96 - ((v - lo) / (hi - lo || 1)) * 74

  const pxLo = Math.min(...pairs.map((p) => p.x))
  const pxHi = Math.max(...pairs.map((p) => p.x))
  const SC_X = 400
  const SC_W = 148
  const scx = (v) => SC_X + ((v - pxLo) / (pxHi - pxLo || 1)) * SC_W
  const scy = (v) => 100 - ((v - lo) / (hi - lo || 1)) * 78

  // бары коррелограммы
  const BAR_TOP = 148
  const BAR_H = 108
  const zero = BAR_TOP + BAR_H / 2
  const bx = (k) => 32 + ((k - 1) / MAXLAG) * (W - 60)
  const by = (v) => zero - v * (BAR_H / 2 - 6)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* --- ряд --- */}
        <text x={32} y={14} fill="#9a907c" fontSize="10.5">{en ? 'the series' : 'сам ряд'}</text>
        <path d={y.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.1" />
        {/* пары, разнесённые на лаг: показываем каждую пятую, иначе каша */}
        {y.map((v, i) =>
          i >= lag && i % 5 === 0 ? (
            <g key={i}>
              <line x1={sx(i - lag)} y1={sy(y[i - lag])} x2={sx(i)} y2={sy(v)} stroke="#2ab8eb" strokeWidth="0.8" opacity="0.55" />
              <circle cx={sx(i - lag)} cy={sy(y[i - lag])} r="2.4" fill="#2ab8eb" />
              <circle cx={sx(i)} cy={sy(v)} r="2.4" fill="#2ab8eb" />
            </g>
          ) : null,
        )}

        {/* --- диаграмма рассеяния пар --- */}
        <text x={SC_X} y={14} fill="#9a907c" fontSize="10.5">{en ? `y(t) vs y(t−${lag})` : `y(t) и y(t−${lag})`}</text>
        <line x1={SC_X} y1={100} x2={SC_X + SC_W} y2={100} stroke="#d6cebf" strokeWidth="1" />
        <line x1={SC_X} y1={22} x2={SC_X} y2={100} stroke="#d6cebf" strokeWidth="1" />
        {pairs.map((p, i) => (
          <circle key={i} cx={scx(p.x)} cy={scy(p.y)} r="2.6" fill="#2ab8eb" opacity="0.65" />
        ))}
        <text x={SC_X + SC_W} y={116} fill="#9a907c" fontSize="9.5" textAnchor="end">
          r = {r[lag].toFixed(2)}
        </text>

        {/* --- коррелограмма --- */}
        <text x={32} y={BAR_TOP - 6} fill="#9a907c" fontSize="10.5">
          {en ? 'correlogram: correlation at every lag' : 'коррелограмма: корреляция на каждом лаге'}
        </text>
        <rect x={32} y={by(band)} width={W - 60} height={by(-band) - by(band)} fill="#9a907c" opacity="0.12" />
        <line x1={32} y1={zero} x2={W - 28} y2={zero} stroke="#d6cebf" strokeWidth="1.2" />
        {r.slice(1).map((v, i) => {
          const k = i + 1
          const active = k === lag
          const strong = Math.abs(v) > band
          return (
            <g key={k} onClick={() => setLag(k)} className="cursor-pointer">
              <rect x={bx(k) - 5} y={BAR_TOP} width="10" height={BAR_H} fill="transparent" />
              <line
                x1={bx(k)} y1={zero} x2={bx(k)} y2={by(v)}
                stroke={active ? '#2ab8eb' : strong ? '#2a2f3a' : '#b6ad9b'}
                strokeWidth={active ? 4 : 2.5}
              />
              {(k === 1 || (k % 7 === 0 && k < MAXLAG)) && (
                <text x={bx(k)} y={BAR_TOP + BAR_H + 12} fill="#9a907c" fontSize="9" textAnchor="middle">{k}</text>
              )}
            </g>
          )
        })}
        <text x={W - 28} y={BAR_TOP + BAR_H + 12} fill="#9a907c" fontSize="9.5" textAnchor="end">
          {en ? 'lag →' : 'лаг →'}
        </text>
      </svg>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {Object.entries(KINDS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`text-xs px-2.5 py-1 rounded-md border ${
              kind === k ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            {en ? v.en : v.ru}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-3 mt-3 text-xs text-gray-700">
        <span className="shrink-0">{en ? 'lag k' : 'лаг k'} = {lag}</span>
        <input type="range" min="1" max={MAXLAG} step="1" value={lag} onChange={(e) => setLag(+e.target.value)} className="w-full accent-cyanink" />
      </label>

      <p className="text-xs text-gray-500 mt-2 max-w-[62ch]">
        {en
          ? 'Each bar is the correlation of the series with itself shifted by k days. Inside the grey band the value is indistinguishable from zero.'
          : 'Каждая палочка — корреляция ряда с самим собой, сдвинутым на k дней. Внутри серой полосы значение неотличимо от нуля.'}
      </p>
    </div>
  )
}
