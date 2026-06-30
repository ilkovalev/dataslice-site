import { useState } from 'react'
import LessonLayout from '../components/LessonLayout.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { lessons, lessonsByModule } from '../content/lessons/index.js'

// Модули = части учебного пути. Уроки внутри модуля + сквозной маршрут
// (массив lessons уже в порядке прохождения) с навигацией Назад/Дальше.
const modules = [
  { id: 1, title: 'Описательная статистика' },
  { id: 2, title: 'Вероятность' },
  { id: 3, title: 'Распределения' },
  { id: 4, title: 'От выборки к миру' },
  { id: 5, title: 'Проверка гипотез' },
  { id: 6, title: 'Эксперименты: A/B' },
  { id: 7, title: 'Связи и регрессия' },
  { id: 8, title: 'Классификация' },
  { id: 9, title: 'Ловушки данных' },
  { id: 10, title: 'Байесовский вывод' },
  { id: 11, title: 'Дисперсионный анализ' },
  { id: 12, title: 'Капстоун' },
]
const moduleTitle = (id) => modules.find((m) => m.id === id)?.title ?? ''

export default function StatsPage() {
  const [activeModule, setActiveModule] = useState(lessons[0].module)
  const [lessonId, setLessonId] = useState(lessons[0].id)

  const moduleLessons = lessonsByModule[activeModule] ?? []
  const globalIdx = lessons.findIndex((l) => l.id === lessonId)
  const current = globalIdx >= 0 ? lessons[globalIdx] : null
  const prev = globalIdx > 0 ? lessons[globalIdx - 1] : null
  const next = globalIdx >= 0 && globalIdx < lessons.length - 1 ? lessons[globalIdx + 1] : null

  function goModule(mId) {
    setActiveModule(mId)
    const first = lessonsByModule[mId]?.[0]
    setLessonId(first ? first.id : null)
  }
  function goLesson(l) {
    setActiveModule(l.module)
    setLessonId(l.id)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Интерактивная статистика</h1>
      <p className="text-gray-600 mb-6">С нуля и через манипуляцию: читайте, предсказывайте, двигайте — и понимайте.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {modules.map((m) => {
          const isActive = m.id === activeModule
          const ready = (lessonsByModule[m.id] ?? []).length > 0
          return (
            <button
              key={m.id}
              onClick={() => goModule(m.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                isActive ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'
              }`}
            >
              {m.id}. {m.title}
              {!ready && <span className="ml-1 text-gray-600">• скоро</span>}
            </button>
          )
        })}
      </div>

      {current && (
        <div className="text-xs text-gray-500 mb-4">
          Вы здесь: урок {globalIdx + 1} из {lessons.length} · модуль {current.module} «{moduleTitle(current.module)}»
        </div>
      )}

      {moduleLessons.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {moduleLessons.map((l) => (
            <button
              key={l.id}
              onClick={() => goLesson(l)}
              className={`text-xs px-2 py-1 rounded ${l.id === lessonId ? 'bg-black/10 text-gray-900' : 'text-gray-500 hover:bg-black/5'}`}
            >
              {l.title}
            </button>
          ))}
        </div>
      )}

      {current ? (
        <>
          <LessonLayout lesson={current} />

          <nav className="max-w-6xl mt-12 pt-5 border-t border-black/10 flex justify-between gap-3">
            {prev ? (
              <button onClick={() => goLesson(prev)} className="text-left text-sm text-gray-700 hover:text-cyanink max-w-[45%]">
                <div className="text-gray-500 text-xs">← Назад</div>
                {prev.title}
              </button>
            ) : <span />}
            {next ? (
              <button onClick={() => goLesson(next)} className="text-right text-sm text-gray-700 hover:text-cyanink max-w-[45%]">
                <div className="text-gray-500 text-xs">Дальше →</div>
                {next.title}
              </button>
            ) : <span />}
          </nav>
          <div className="max-w-6xl mt-10">
            {next
              ? <SubscribeCTA />
              : <SubscribeCTA heading="Поздравляем — вы дошли до конца! 🎉" text="Эти материалы делает канал «Кусочек пиццы». Подпишитесь, чтобы не потерять и получать разборы кейсов, метрик и карьеры в аналитике." />}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-black/15 bg-panel/50 p-10 text-center text-gray-500">
          Уроки этого модуля в разработке. Готова часть 1 — «Описательная статистика».
        </div>
      )}
    </div>
  )
}
