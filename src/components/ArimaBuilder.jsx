import { useState } from 'react'
import { makeSeries, arimaForecast, mape, SEASON } from '../lib/timeseries.js'

// Модуль 8, урок 5. Конструктор семейства: каждая буква названия включается
// отдельным переключателем, и сразу видно, что она добавляет прогнозу.
// AR — опора на прошлые значения, I — дифференцирование, MA — поправка на
// прошлую ошибку, S — недельный цикл, X — внешний фактор (акция).
// Ряд один и тот же во всех уроках модуля; в горизонт намеренно попадает день
// акции — без X его не предсказать никаким количеством лагов.
const W = 560
const H = 250
const PAD_L = 34
const N = 84
const HOLD = 14
const CUT = N - HOLD
const PROMO = [{ at: 20, size: 45 }, { at: 39, size: 45 }, { at: 58, size: 45 }, { at: 76, size: 45 }]

export default function ArimaBuilder({ locale = 'ru' }) {
  const en = locale === 'en'
  const [p, setP] = useState(1)
  const [d, setD] = useState(1)
  const [q, setQ] = useState(0)
  const [seasonal, setSeasonal] = useState(false)
  const [exog, setExog] = useState(false)

  const s = makeSeries({ n: N, trend: 0.45, seasonAmp: 14, noise: 4, seed: 7, promo: PROMO })
  const train = s.y.slice(0, CUT)
  const test = s.y.slice(CUT)
  const promoTrain = Array.from({ length: CUT }, (_, i) => (PROMO.some((x) => x.at === i) ? 1 : 0))
  const promoFuture = Array.from({ length: HOLD }, (_, i) => (PROMO.some((x) => x.at === CUT + i) ? 1 : 0))

  const { forecast, phi, theta, beta } = arimaForecast(train, {
    p, d, q, seasonal, exog, h: HOLD, promoTrain, promoFuture,
  })
  const err = mape(test, forecast)
  const pi = promoFuture.indexOf(1)
  const promoErr = pi >= 0 ? (100 * Math.abs(test[pi] - forecast[pi])) / test[pi] : NaN

  const name = `${seasonal ? 'S' : ''}ARIMA${exog ? 'X' : ''}(${p},${d},${q})${seasonal ? `(1,0,0)₇` : ''}`

  const all = [...s.y, ...forecast]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const sx = (i) => PAD_L + (i / (N - 1)) * (W - PAD_L - 12)
  const sy = (v) => 176 - ((v - lo) / (hi - lo || 1)) * 150

  const Stepper = ({ label, value, set, max, hint }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-700 w-[7.5rem] shrink-0">
        <span className="font-mono">{label}</span> <span className="text-gray-500">{hint}</span>
      </span>
      <div className="flex">
        {Array.from({ length: max + 1 }, (_, k) => (
          <button
            key={k}
            onClick={() => set(k)}
            className={`text-xs w-7 py-1 border ${k ? '' : 'rounded-l-md'} ${k === max ? 'rounded-r-md' : ''} -ml-px ${
              value === k ? 'border-cyanink text-cyanink bg-accent/10 z-10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={sx(CUT - 1)} y1={18} x2={sx(CUT - 1)} y2={182} stroke="#d6cebf" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={sx(CUT - 1) + 4} y={14} fill="#9a907c" fontSize="9.5">{en ? 'forecast horizon' : 'горизонт прогноза'}</text>

        {/* дни акций */}
        {PROMO.map((x) => (
          <g key={x.at}>
            <line x1={sx(x.at)} y1={22} x2={sx(x.at)} y2={176} stroke="#a86ec4" strokeWidth="1" opacity="0.35" />
            <text x={sx(x.at)} y={194} fill="#a86ec4" fontSize="8.5" textAnchor="middle">{en ? 'promo' : 'акция'}</text>
          </g>
        ))}

        <path d={train.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" />
        <path d={test.map((v, i) => `${i ? 'L' : 'M'}${sx(CUT + i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" opacity="0.3" />
        <path
          d={forecast.map((v, i) => `${i ? 'L' : 'M'}${sx(CUT + i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')}
          fill="none" stroke="#2ab8eb" strokeWidth="2.2"
        />
        {/* промах именно в день акции — ради него и нужен X */}
        {pi >= 0 && (
          <line x1={sx(CUT + pi)} y1={sy(test[pi])} x2={sx(CUT + pi)} y2={sy(forecast[pi])} stroke="#e0575b" strokeWidth="2" opacity="0.8" />
        )}
        <text x={4} y={30} fill="#9a907c" fontSize="9">{Math.round(hi)}</text>
        <text x={4} y={176} fill="#9a907c" fontSize="9">{Math.round(lo)}</text>

        <text x={PAD_L} y={216} fill="#2a2f3a" fontSize="13" className="font-mono">{name}</text>
        <text x={PAD_L} y={234} fill="#9a907c" fontSize="10">
          {en ? 'error on the hidden days' : 'ошибка на спрятанных днях'}: MAPE {isNaN(err) ? '—' : `${err.toFixed(1)}%`}
          {pi >= 0 && ` · ${en ? 'on the promo day' : 'в день акции'} ${promoErr.toFixed(1)}%`}
        </text>
      </svg>

      <div className="mt-1 grid sm:grid-cols-2 gap-x-6 gap-y-2">
        <Stepper label="p" value={p} set={setP} max={2} hint={en ? 'past values (AR)' : 'прошлые значения (AR)'} />
        <Stepper label="d" value={d} set={setD} max={2} hint={en ? 'differences (I)' : 'разности (I)'} />
        <Stepper label="q" value={q} set={setQ} max={1} hint={en ? 'past errors (MA)' : 'прошлые ошибки (MA)'} />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSeasonal((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-md border ${
              seasonal ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            S · {en ? `weekly cycle (${SEASON})` : `недельный цикл (${SEASON})`}
          </button>
          <button
            onClick={() => setExog((v) => !v)}
            className={`text-xs px-2.5 py-1 rounded-md border ${
              exog ? 'border-cyanink text-cyanink bg-accent/10' : 'border-black/15 text-gray-700 hover:bg-black/5'
            }`}
          >
            X · {en ? 'promo calendar' : 'календарь акций'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {phi.map((v, i) => (
          <span key={i}>φ{i + 1} = {v.toFixed(2)}</span>
        ))}
        {q > 0 && <span>θ = {theta.toFixed(2)}</span>}
        {exog && <span style={{ color: '#8b53ad' }}>{en ? 'promo effect' : 'эффект акции'} β = {beta ? `+${beta.toFixed(0)}` : '—'}</span>}
      </div>

      <p className="text-xs text-gray-500 mt-2 max-w-[62ch]">
        {en
          ? 'Red bar is the miss on the promo day. No number of lags predicts it: the reason lies outside the series, and only X brings it in.'
          : 'Красная черта — промах в день акции. Никакое число лагов его не предскажет: причина лежит вне ряда, и заводит её внутрь только X.'}
      </p>
    </div>
  )
}
