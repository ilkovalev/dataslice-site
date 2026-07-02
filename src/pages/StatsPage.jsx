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

// Боковое оглавление с прогрессом (пины 1, 2 ревью): видно, где ты среди всех
// уроков, что пройдено (галочки) и сколько осталось (полоса прогресса).
function Sidebar({ activeModule, lessonId, globalIdx, onModule, onLesson }) {
  const total = lessons.length
  const pct = Math.round(((globalIdx + 1) / total) * 100)
  return (
    <aside className="md:sticky md:top-20 md:self-start">
      <div className="rounded-xl border border-black/10 bg-panel/70 p-4">
        <div className="flex items-baseline justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-900">Прогресс</span>
          <span className="text-gray-500">урок {globalIdx + 1} / {total}</span>
        </div>
        <div className="h-2 rounded-full bg-black/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <nav className="mt-4 max-h-[60vh] md:max-h-none overflow-auto pr-1">
        <ol className="space-y-1">
          {modules.map((m) => {
            const list = lessonsByModule[m.id] ?? []
            const ready = list.length > 0
            const isActive = m.id === activeModule
            return (
              <li key={m.id}>
                <button
                  onClick={() => ready && onModule(m.id)}
                  disabled={!ready}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                    isActive ? 'bg-accent/15 text-cyanink font-medium' : ready ? 'text-gray-700 hover:bg-black/5' : 'text-gray-400 cursor-default'
                  }`}
                >
                  <span className="tabular-nums text-gray-400 mr-1.5">{m.id}.</span>
                  {m.title}
                  {!ready && <span className="ml-1.5 text-xs text-gray-400">скоро</span>}
                </button>

                {isActive && list.length > 0 && (
                  <ul className="mt-0.5 ml-3 border-l border-black/10 pl-2 space-y-0.5">
                    {list.map((l) => {
                      const idx = lessons.findIndex((x) => x.id === l.id)
                      const done = idx < globalIdx
                      const current = l.id === lessonId
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => onLesson(l)}
                            className={`w-full text-left flex items-start gap-1.5 text-[13px] px-2 py-1 rounded transition-colors ${
                              current ? 'bg-black/[0.06] text-gray-900 font-medium' : 'text-gray-600 hover:bg-black/5'
                            }`}
                          >
                            <span className={`mt-0.5 shrink-0 ${done ? 'text-accent' : current ? 'text-cyanink' : 'text-gray-300'}`} aria-hidden>
                              {done ? '✓' : current ? '▸' : '○'}
                            </span>
                            <span>{l.title}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </aside>
  )
}

export default function StatsPage() {
  const [activeModule, setActiveModule] = useState(lessons[0].module)
  const [lessonId, setLessonId] = useState(lessons[0].id)

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
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Интерактивная статистика</h1>
      <p className="text-gray-600 mb-6 max-w-2xl">С нуля и через манипуляцию: читайте, предсказывайте, двигайте — и понимайте.</p>

      <div className="md:grid md:grid-cols-[248px_minmax(0,1fr)] md:gap-8">
        <Sidebar
          activeModule={activeModule}
          lessonId={lessonId}
          globalIdx={globalIdx}
          onModule={goModule}
          onLesson={goLesson}
        />

        <div className="min-w-0 mt-8 md:mt-0">
          {current ? (
            <>
              <div className="text-xs text-gray-500 mb-4">
                Модуль {current.module} «{moduleTitle(current.module)}»
              </div>

              <LessonLayout lesson={current} />

              <nav className="mt-12 pt-5 border-t border-black/10 flex justify-between gap-3">
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
              <div className="mt-10">
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
      </div>
    </div>
  )
}
