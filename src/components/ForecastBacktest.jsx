import { useState } from 'react'
import { makeSeries, arimaForecast, mape, mae, SEASON } from '../lib/timeseries.js'

// Модуль 8, урок 6. Бэктест со скользящим началом: обучаемся только на том,
// что было до точки отсечения, прогнозируем следующие две недели, сдвигаем
// точку и повторяем. Отсюда две вещи, которые нельзя увидеть на одном сплите:
// ошибка не одна, а разная от периода к периоду, и она растёт с горизонтом.
// Ориентир — сезонно-наивный прогноз («будет как неделю назад»): модель,
// которая его не бьёт, не нужна.
const W = 560
const H = 300
const PAD_L = 34
const N = 98
const HOR = 14
const ORIGINS = [56, 70, 84] // точки отсечения

export default function ForecastBacktest({ locale = 'ru' }) {
  const en = locale === 'en'
  const [fold, setFold] = useState(0)
  const [showNaive, setShowNaive] = useState(true)

  // walk: уровень ряда дрейфует, как в жизни. Без этого будущее отличается от
  // прошлого только iid-шумом, и ошибка не растёт с горизонтом — панель внизу
  // показывала бы ровный частокол, противоречащий тексту урока.
  const s = makeSeries({ n: N, trend: 0.45, seasonAmp: 14, noise: 4, seed: 7, walk: 1.2 })

  // прогноз обеих моделей из каждой точки отсечения
  const folds = ORIGINS.map((cut) => {
    const train = s.y.slice(0, cut)
    const actual = s.y.slice(cut, cut + HOR)
    const model = arimaForecast(train, { p: 1, d: 1, q: 1, seasonal: true, h: HOR }).forecast
    // сезонно-наивный: повторяем последнюю известную неделю
    const naive = Array.from({ length: HOR }, (_, h) => train[train.length - SEASON + (h % SEASON)])
    return { cut, actual, model, naive, mapeModel: mape(actual, model), mapeNaive: mape(actual, naive), maeModel: mae(actual, model) }
  })
  const f = folds[fold]

  // средняя ошибка по шагу горизонта — по всем фолдам сразу
  const byStep = Array.from({ length: HOR }, (_, h) => {
    const errs = folds.map((x) => Math.abs((x.actual[h] - x.model[h]) / x.actual[h]) * 100)
    return errs.reduce((a, b) => a + b, 0) / errs.length
  })
  const stepMax = Math.max(...byStep, 1)
  const avgModel = folds.reduce((a, x) => a + x.mapeModel, 0) / folds.length
  const avgNaive = folds.reduce((a, x) => a + x.mapeNaive, 0) / folds.length

  const all = [...s.y, ...f.model, ...f.naive]
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const sx = (i) => PAD_L + (i / (N - 1)) * (W - PAD_L - 12)
  const sy = (v) => 150 - ((v - lo) / (hi - lo || 1)) * 124

  const BAR_TOP = 210
  const BAR_H = 62
  const bx = (h) => PAD_L + 6 + (h / (HOR - 1)) * (W - PAD_L - 70)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* обучающая часть до точки отсечения */}
        <rect x={PAD_L} y={20} width={sx(f.cut - 1) - PAD_L} height={132} fill="#9a907c" opacity="0.07" />
        <text x={PAD_L + 4} y={32} fill="#9a907c" fontSize="9.5">{en ? 'training data' : 'обучающая часть'}</text>
        <line x1={sx(f.cut - 1)} y1={20} x2={sx(f.cut - 1)} y2={152} stroke="#d6cebf" strokeWidth="1.2" strokeDasharray="4 3" />

        <path d={s.y.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.5" opacity="0.35" />
        <path d={s.y.slice(0, f.cut).map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2a2f3a" strokeWidth="1.6" />

        {showNaive && (
          <path d={f.naive.map((v, i) => `${i ? 'L' : 'M'}${sx(f.cut + i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#9a907c" strokeWidth="1.8" strokeDasharray="4 3" />
        )}
        <path d={f.model.map((v, i) => `${i ? 'L' : 'M'}${sx(f.cut + i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} fill="none" stroke="#2ab8eb" strokeWidth="2.2" />

        {/* отметки всех точек отсечения */}
        {ORIGINS.map((c, i) => (
          <g key={c} onClick={() => setFold(i)} className="cursor-pointer">
            <circle cx={sx(c - 1)} cy={162} r={fold === i ? 5 : 3.5} fill={fold === i ? '#2ab8eb' : '#b6ad9b'} />
            <text x={sx(c - 1)} y={180} fill={fold === i ? '#2ab8eb' : '#9a907c'} fontSize="9" textAnchor="middle">
              {en ? `fold ${i + 1}` : `окно ${i + 1}`}
            </text>
          </g>
        ))}

        {/* ошибка по шагу горизонта */}
        <text x={PAD_L} y={BAR_TOP - 8} fill="#9a907c" fontSize="10">
          {en ? 'average error by forecast step, all folds' : 'средняя ошибка по шагу прогноза, все окна'}
        </text>
        {byStep.map((v, h) => (
          <rect key={h} x={bx(h) - 7} y={BAR_TOP + BAR_H - (v / stepMax) * BAR_H} width="14" height={(v / stepMax) * BAR_H} fill="#2ab8eb" opacity="0.75" />
        ))}
        <line x1={PAD_L} y1={BAR_TOP + BAR_H} x2={W - 56} y2={BAR_TOP + BAR_H} stroke="#d6cebf" strokeWidth="1" />
        <text x={PAD_L} y={BAR_TOP + BAR_H + 12} fill="#9a907c" fontSize="9">{en ? 'day 1' : 'день 1'}</text>
        <text x={W - 56} y={BAR_TOP + BAR_H + 12} fill="#9a907c" fontSize="9" textAnchor="end">{en ? `day ${HOR}` : `день ${HOR}`}</text>
        <text x={W - 48} y={BAR_TOP + 10} fill="#9a907c" fontSize="9">{stepMax.toFixed(0)}%</text>
      </svg>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="text-[#2ab8eb]">
          SARIMA: MAPE {f.mapeModel.toFixed(1)}% · MAE {f.maeModel.toFixed(1)}
        </span>
        <span className="text-gray-500">
          {en ? 'seasonal naive' : 'сезонно-наивный'}: MAPE {f.mapeNaive.toFixed(1)}%
        </span>
        <span className="text-gray-500">
          {en ? 'across folds' : 'по всем окнам'}: {avgModel.toFixed(1)}% {en ? 'vs' : 'против'} {avgNaive.toFixed(1)}%
        </span>
        <button
          onClick={() => setShowNaive((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5"
        >
          {showNaive ? (en ? 'hide the baseline' : 'скрыть ориентир') : (en ? 'show the baseline' : 'показать ориентир')}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 max-w-[62ch]">
        {en
          ? 'The split runs along time, never at random: a randomly chosen test day would leave the model its own neighbours — tomorrow predicted from the day after tomorrow.'
          : 'Разрез идёт по времени, а не случайно: при случайном отборе тестовых дней модель училась бы на их соседях — завтра предсказывалось бы послезавтрашним днём.'}
      </p>
    </div>
  )
}
