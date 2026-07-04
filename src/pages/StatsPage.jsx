import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LessonLayout from '../components/LessonLayout.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { lessons, lessonsByModule } from '../content/lessons/index.js'
import { track } from '../lib/analytics.js'

// Модули = части учебного пути. Уроки внутри модуля + сквозной маршрут
// (массив lessons уже в порядке прохождения) с навигацией Назад/Дальше.
const modules = [
  { id: 1, title: 'Описательная статистика', icon: '📊' },
  { id: 2, title: 'Вероятность', icon: '🎲' },
  { id: 3, title: 'Распределения', icon: '🔔' },
  { id: 4, title: 'От выборки к миру', icon: '🎯' },
  { id: 5, title: 'Проверка гипотез', icon: '⚖️' },
  { id: 6, title: 'Эксперименты: A/B', icon: '🧪' },
  { id: 7, title: 'Связи и регрессия', icon: '📈' },
  { id: 8, title: 'Классификация', icon: '🏷️' },
  { id: 9, title: 'Ловушки данных', icon: '🪤' },
  { id: 10, title: 'Байесовский вывод', icon: '🔄' },
  { id: 11, title: 'Дисперсионный анализ', icon: '🧩' },
  { id: 12, title: 'Капстоун', icon: '🏁' },
]
const moduleTitle = (id) => modules.find((m) => m.id === id)?.title ?? ''
const moduleIcon = (id) => modules.find((m) => m.id === id)?.icon ?? ''

const DEFAULT_TITLE = '«Кусочек пиццы» — интерактивная статистика и метрики'

// Прогресс живёт в localStorage: текущий урок + пройденные (пройден = дошёл
// до последнего бита). Версия в ключе — на случай смены схемы.
const LS_KEY = 'pizza-progress-v1'
const validIds = new Set(lessons.map((l) => l.id))
function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY)) || {}
    return {
      lessonId: validIds.has(raw.lessonId) ? raw.lessonId : lessons[0].id,
      completed: new Set((raw.completed || []).filter((id) => validIds.has(id))),
    }
  } catch {
    return { lessonId: lessons[0].id, completed: new Set() }
  }
}
function saveProgress(lessonId, completed) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ lessonId, completed: [...completed] }))
  } catch {
    /* приватный режим — живём без сохранения */
  }
}
const saved = loadProgress()

// Ссылка на урок: системный share на мобильном, копирование на десктопе.
function ShareButton({ lesson }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    const url = `https://data-slice.ru/stats/${lesson.id}`
    track('share', { id: lesson.id })
    if (navigator.share) {
      try { await navigator.share({ title: lesson.title, url }) } catch { /* отменили — ок */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* нет clipboard — молча */ }
  }
  return (
    <button
      onClick={share}
      title="Ссылка на этот урок"
      className="shrink-0 text-xs px-2.5 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-black/5 transition-colors"
    >
      {copied ? '✓ ссылка скопирована' : '🔗 поделиться уроком'}
    </button>
  )
}

// Боковое оглавление с прогрессом: видно, где ты среди всех уроков,
// что пройдено (галочки) и сколько осталось (полоса прогресса).
function Sidebar({ activeModule, lessonId, globalIdx, completed, onModule, onLesson }) {
  const [open, setOpen] = useState(false) // раскрытие списка уроков на мобильном
  const total = lessons.length
  const pct = Math.round((completed.size / total) * 100)
  const currentTitle = lessons[globalIdx]?.title ?? ''
  // на мобильном после выбора урока список сворачиваем — сразу видно контент
  const selectLesson = (l) => { onLesson(l); setOpen(false) }
  return (
    <aside className="md:sticky md:top-20 md:self-start">
      <div className="rounded-xl border border-black/10 bg-panel/70 p-4">
        <div className="flex items-baseline justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-900">Прогресс</span>
          <span className="text-gray-500">пройдено {completed.size} / {total}</span>
        </div>
        <div className="h-2 rounded-full bg-black/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* мобильный переключатель: сворачивает/разворачивает список уроков */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="md:hidden mt-3 w-full flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-panel/70 px-3 py-2 text-sm text-gray-700"
      >
        <span className="truncate text-left"><span className="text-gray-400 mr-1.5">{open ? 'Свернуть' : 'Оглавление'} ·</span>{currentTitle}</span>
        <span className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>▾</span>
      </button>

      <nav className={`${open ? 'block' : 'hidden'} md:block mt-3 md:mt-4 max-h-[60vh] md:max-h-none overflow-auto pr-1`}>
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
                  {m.title} <span className="opacity-70" aria-hidden>{m.icon}</span>
                  {!ready && <span className="ml-1.5 text-xs text-gray-400">скоро</span>}
                </button>

                {isActive && list.length > 0 && (
                  <ul className="mt-0.5 ml-3 border-l border-black/10 pl-2 space-y-0.5">
                    {list.map((l) => {
                      const done = completed.has(l.id)
                      const current = l.id === lessonId
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => selectLesson(l)}
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
  const { lessonSlug } = useParams()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(saved.completed)

  // Урок задаётся URL-ом (/stats/:lessonSlug) — так уроки можно шарить
  // и добавлять в закладки. Модуль всегда следует за текущим уроком.
  const globalIdx = validIds.has(lessonSlug) ? lessons.findIndex((l) => l.id === lessonSlug) : -1
  const current = globalIdx >= 0 ? lessons[globalIdx] : null
  const prev = globalIdx > 0 ? lessons[globalIdx - 1] : null
  const next = globalIdx >= 0 && globalIdx < lessons.length - 1 ? lessons[globalIdx + 1] : null
  const activeModule = current?.module ?? null

  // Голый /stats или неизвестный slug → на последний открытый (или первый) урок.
  useEffect(() => {
    if (!current) navigate(`/stats/${loadProgress().lessonId}`, { replace: true })
  }, [current, navigate])

  useEffect(() => {
    if (current) saveProgress(current.id, completed)
  }, [current, completed])

  // Скролл наверх при любой смене урока (клики, «См. также», назад/вперёд).
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [lessonSlug])

  useEffect(() => {
    if (!current) return
    track('lesson_view', { id: current.id })
    document.title = `${current.title} — «Кусочек пиццы»`
    return () => { document.title = DEFAULT_TITLE }
  }, [current])

  function markComplete(id) {
    if (completed.has(id)) return
    track('lesson_complete', { id })
    setCompleted((prevSet) => new Set(prevSet).add(id))
  }

  function goLesson(l) {
    navigate(`/stats/${l.id}`)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function goModule(mId) {
    const first = lessonsByModule[mId]?.[0]
    if (first) goLesson(first)
  }

  if (!current) return null

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Интерактивная статистика</h1>
      <p className="text-gray-600 mb-6 max-w-2xl">
        {lessons.length} бесплатных интерактивных уроков — от среднего и медианы до A/B-тестов и Байеса.
        Читайте, предсказывайте, двигайте графики — и стройте интуицию. Без регистрации.
      </p>

      <div className="md:grid md:grid-cols-[248px_minmax(0,1fr)] md:gap-8">
        <Sidebar
          activeModule={activeModule}
          lessonId={current.id}
          globalIdx={globalIdx}
          completed={completed}
          onModule={goModule}
          onLesson={goLesson}
        />

        <div className="min-w-0 mt-8 md:mt-0">
          <div className="text-xs text-gray-500 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span><span aria-hidden>{moduleIcon(current.module)}</span> Модуль {current.module} «{moduleTitle(current.module)}»</span>
            <ShareButton lesson={current} />
          </div>

          <LessonLayout
            lesson={current}
            onComplete={() => markComplete(current.id)}
            onNext={next ? () => goLesson(next) : undefined}
          />

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
        </div>
      </div>
    </div>
  )
}
