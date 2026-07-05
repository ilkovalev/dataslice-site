import { useState } from 'react'

// Пирамида доказательной силы: снизу — слабые свидетельства (мнение, корреляция),
// сверху — сильные (рандомизированный A/B и мета-анализ). Кликните уровень.
const LEVELS = [
  { w: '40%', name: 'Мета-анализ A/B', nameEn: 'Meta-analysis of A/Bs', strong: true, note: 'Сводка многих независимых экспериментов. Самое надёжное: случайные удачи отдельных тестов взаимно гасятся.', noteEn: 'A summary of many independent experiments. The most reliable: the random flukes of individual tests cancel each other out.' },
  { w: '56%', name: 'A/B-тест (рандомизированный)', nameEn: 'A/B test (randomized)', strong: true, ab: true, note: 'Случайное деление на группы уравнивает все прочие факторы → видимая разница вызвана именно изменением. Золотой стандарт причинности.', noteEn: 'Random assignment to groups equalizes all other factors → the visible difference is caused by the change itself. The gold standard of causality.' },
  { w: '72%', name: 'Квази-эксперимент (до/после)', nameEn: 'Quasi-experiment (before/after)', note: 'Меняем для всех и сравниваем «до» и «после». Нет контрольной группы — эффект легко спутать с сезоном, трендом, другими изменениями.', noteEn: 'Change for everyone and compare "before" vs "after". No control group — the effect is easily confused with season, trend, or other changes.' },
  { w: '88%', name: 'Наблюдение / корреляция', nameEn: 'Observation / correlation', note: 'Заметили связь в данных без вмешательства. Может оказаться ложной или объясняться скрытой третьей причиной (корреляция ≠ причинность).', noteEn: 'A relationship spotted in data without intervention. It may be spurious or explained by a hidden third cause (correlation ≠ causation).' },
  { w: '100%', name: 'Мнение / анекдот', nameEn: 'Opinion / anecdote', note: '«Мне кажется, так лучше», единичный случай, отзыв. Слабее всего: легко поддаётся искажениям и ошибке выжившего.', noteEn: '"It feels better this way", a single case, a review. The weakest: prone to biases and survivorship bias.' },
]

export default function EvidencePyramid({ locale = 'ru' }) {
  const en = locale === 'en'
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
            {en ? l.nameEn : l.name}{l.ab && <span className="text-[10px] text-cyanink ml-1">★</span>}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-gray-500 mt-1.5 px-1">
        <span>{en ? '↑ stronger' : '↑ сильнее'}</span><span>{en ? 'weaker ↓' : 'слабее ↓'}</span>
      </div>
      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-4 py-3 text-sm">
        <div className={`font-medium ${LEVELS[sel].strong ? 'text-cyanink' : 'text-gray-900'}`}>{en ? LEVELS[sel].nameEn : LEVELS[sel].name}</div>
        <div className="text-gray-600 mt-1 leading-relaxed">{en ? LEVELS[sel].noteEn : LEVELS[sel].note}</div>
      </div>
    </div>
  )
}
