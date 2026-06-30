// Карта пройденного пути: модули, связанные в маршрут (змейка по рядам).
const W = 640
const H = 170
const STEPS = [
  'Описательная', 'Распределения', 'Вероятность', 'Выборка → мир', 'Гипотезы',
  'A/B', 'Регрессия', 'Классификация', 'Ловушки данных',
]
const COLS = 5

export default function JourneyMap() {
  const pos = STEPS.map((_, i) => {
    const row = Math.floor(i / COLS)
    const idxInRow = i % COLS
    const col = row % 2 === 0 ? idxInRow : COLS - 1 - idxInRow // змейка
    const x = 60 + col * ((W - 120) / (COLS - 1))
    const y = 45 + row * 75
    return { x, y }
  })
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {pos.slice(1).map((p, i) => (
          <line key={i} x1={pos[i].x} y1={pos[i].y} x2={p.x} y2={p.y} stroke="#2ab8eb" strokeWidth="1.5" opacity="0.35" />
        ))}
        {pos.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="13" fill="#2ab8eb" opacity="0.18" stroke="#2ab8eb" strokeWidth="1.5" />
            <text x={p.x} y={p.y + 4} fill="#2ab8eb" fontSize="11" textAnchor="middle">{i + 1}</text>
            <text x={p.x} y={p.y - 20} fill="#374151" fontSize="9.5" textAnchor="middle">{STEPS[i]}</text>
          </g>
        ))}
      </svg>
      <p className="text-sm text-gray-600 mt-2">Весь маршрут: от описания данных до моделей и ловушек, на которых сыплются.</p>
    </div>
  )
}
