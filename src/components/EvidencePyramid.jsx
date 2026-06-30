import { useState } from 'react'

// Пирамида доказательной силы: снизу — слабые свидетельства (мнение, корреляция),
// сверху — сильные (рандомизированный A/B и мета-анализ). Кликните уровень.
const LEVELS = [
  { w: '40%', name: 'Мета-анализ A/B', strong: true, note: 'Сводка многих независимых экспериментов. Самое надёжное: случайные удачи отдельных тестов взаимно гасятся.' },
  { w: '56%', name: 'A/B-тест (рандомизированный)', strong: true, ab: true, note: 'Случайное деление на группы уравнивает все прочие факторы → видимая разница вызвана именно изменением. Золотой стандарт причинности.' },
  { w: '72%', name: 'Квази-эксперимент (до/после)', note: 'Меняем для всех и сравниваем «до» и «после». Нет контрольной группы — эффект легко спутать с сезоном, трендом, другими изменениями.' },
  { w: '88%', name: 'Наблюдение / корреляция', note: 'Заметили связь в данных без вмешательства. Может оказаться ложной или объясняться скрытой третьей причиной (корреляция ≠ причинность).' },
  { w: '100%', name: 'Мнение / анекдот', note: '«Мне кажется, так лучше», единичный случай, отзыв. Слабее всего: легко поддаётся искажениям и ошибке выжившего.' },
]

export default function EvidencePyramid() {
  const [sel, setSel] = useState(1)
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-col items-center gap-1.5">
        {LEVELS.map((l, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            style={{ width: l.w }}
            className={`rounded-md border px-3 py-2 text-center text-sm transition-colors ${
              sel === i ? 'border-accent/60 bg-accent/15 text-cyanink' : l.ab ? 'border-accent/40 bg-accent/8 text-gray-800' : 'border-black/10 bg-ink text-gray-700 hover:bg-black/5'
            }`}
          >
            {l.name}{l.ab && <span className="text-[10px] text-cyanink ml-1">★</span>}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 mt-1.5 px-1">
        <span>↑ сильнее</span><span>слабее ↓</span>
      </div>
      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-4 py-3 text-sm">
        <div className={`font-medium ${LEVELS[sel].strong ? 'text-cyanink' : 'text-gray-900'}`}>{LEVELS[sel].name}</div>
        <div className="text-gray-600 mt-1 leading-relaxed">{LEVELS[sel].note}</div>
      </div>
    </div>
  )
}
