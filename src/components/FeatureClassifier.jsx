import { useState } from 'react'

// Принцип классификатора: два признака (фичи) по осям, два класса точек,
// и разделяющая прямая (гиперплоскость в 2D). Двигаем наклон и сдвиг линии —
// точки по одну сторону относим к одному классу, по другую — к другому.
// Ошибки (точки не на своей стороне) подсвечиваются.
const W = 420
const H = 320
const PAD = 34
const MIN = 0
const MAX = 100

// класс 0 (обычные письма) — слева-снизу; класс 1 (спам) — справа-сверху
const C0 = [[18, 30], [26, 18], [30, 44], [38, 28], [22, 52], [44, 38], [34, 60], [50, 22], [16, 40], [42, 54]]
const C1 = [[62, 70], [70, 54], [76, 78], [58, 62], [84, 66], [66, 84], [80, 46], [54, 78], [88, 74], [72, 38]]

export default function FeatureClassifier({ locale = 'ru' }) {
  const en = locale === 'en'
  const [angle, setAngle] = useState(-30) // градусы наклона линии
  const [offset, setOffset] = useState(50) // сдвиг по вертикали

  const sx = (x) => PAD + ((x - MIN) / (MAX - MIN)) * (W - 2 * PAD)
  const sy = (y) => H - PAD - ((y - MIN) / (MAX - MIN)) * (H - 2 * PAD)
  // линия: y = slope·(x-50) + offset
  const slope = Math.tan((angle * Math.PI) / 180)
  const lineY = (x) => slope * (x - 50) + offset
  // предсказание: выше линии → класс 1 (спам)
  const predict = (x, y) => (y > lineY(x) ? 1 : 0)

  let errors = 0
  const render = (arr, cls, color) =>
    arr.map(([x, y], i) => {
      const wrong = predict(x, y) !== cls
      if (wrong) errors++
      return (
        <g key={`${cls}-${i}`}>
          {wrong && <circle cx={sx(x)} cy={sy(y)} r="9" fill="none" stroke="#f87171" strokeWidth="2" />}
          <circle cx={sx(x)} cy={sy(y)} r="6" fill={color} />
        </g>
      )
    })
  const dots0 = render(C0, 0, '#6b7280')
  const dots1 = render(C1, 1, '#2ab8eb')
  const total = C0.length + C1.length

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        {/* зоны предсказания */}
        <defs>
          <clipPath id="plot"><rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} /></clipPath>
        </defs>
        <g clipPath="url(#plot)">
          <polygon points={`${sx(0)},${sy(lineY(0))} ${sx(100)},${sy(lineY(100))} ${sx(100)},${sy(100)} ${sx(0)},${sy(100)}`} fill="#2ab8eb" opacity="0.06" />
          <line x1={sx(0)} y1={sy(lineY(0))} x2={sx(100)} y2={sy(lineY(100))} stroke="#2a2f3a" strokeWidth="2" strokeDasharray="5 3" />
        </g>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <text x={W - PAD} y={H - PAD + 20} fill="#9a907c" fontSize="11" textAnchor="end">{en ? 'feature 1: share of links →' : 'фича 1: доля ссылок →'}</text>
        <text x={PAD - 6} y={PAD - 12} fill="#9a907c" fontSize="11">{en ? 'feature 2: "urgent/money"' : 'фича 2: «срочно/деньги»'}</text>
        {dots0}
        {dots1}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
        <span className="text-[#2ab8eb]">● {en ? 'spam' : 'спам'}</span>
        <span className="text-gray-500">● {en ? 'not spam' : 'не спам'}</span>
        <span className="text-[#f87171]">○ {en ? 'error' : 'ошибка'}</span>
        <span className="ml-auto text-gray-700">{en ? 'Errors:' : 'Ошибок:'} <span className="tabular-nums font-medium">{errors}</span> {en ? 'of' : 'из'} {total}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Line slope' : 'Наклон линии'}</span><span className="tabular-nums text-cyanink">{angle}°</span></div>
          <input type="range" min="-80" max="80" value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Shift' : 'Сдвиг'}</span><span className="tabular-nums text-cyanink">{offset}</span></div>
          <input type="range" min="20" max="80" value={offset} onChange={(e) => setOffset(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'Tune the slope and the shift so the line separates the classes with the fewest errors. That is what a classifier does — searches for a hyperplane in feature space.'
        : 'Подберите наклон и сдвиг так, чтобы линия разделила классы с наименьшим числом ошибок. Это и делает классификатор — ищет гиперплоскость в пространстве признаков.'}</p>
    </div>
  )
}
