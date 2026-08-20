import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import LessonLayout from '../components/LessonLayout.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { lessons, lessonsByModule, loadLesson } from '../content/lessons/index.js'
import { track } from '../lib/analytics.js'
import { useLocale, prefix, STR } from '../lib/i18n.js'

// Модули = части учебного пути (названия — в словаре i18n).
const moduleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const moduleIcons = { 1: '📊', 2: '🎲', 3: '🔔', 4: '🎯', 5: '⚖️', 6: '🧪', 7: '📈', 8: '🔮', 9: '🏷️', 10: '🪤', 11: '🔄', 12: '🧩', 13: '🏁' }

// Прогресс живёт в localStorage: текущий урок + пройденные (пройден = дошёл
// до последнего бита). Общий для обеих локалей.
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

// Заголовок урока в текущей локали. Работает по лёгкому индексу: навигации
// и оглавлению полный текст урока не нужен, а тянуть его ради заголовка —
// значит вернуть в чанк весь курс.
function localizedLesson(entry, locale) {
  if (!entry) return entry
  return { ...entry, title: (locale === 'en' && entry.titleEn) || entry.title }
}

// Ссылка на урок: системный share на мобильном, копирование на десктопе.
function ShareButton({ lesson, locale, t }) {
  const [copied, setCopied] = useState(false)
  // Ссылка, которую не удалось положить в буфер: в Telegram-браузере и Safari
  // clipboard.writeText отклоняется, поэтому показываем URL и даём скопировать руками.
  const [manual, setManual] = useState('')
  const manualRef = useRef(null)
  async function share() {
    const url = `https://data-slice.ru${prefix(locale)}/stats/${lesson.id}`
    track('share', { id: lesson.id })
    if (navigator.share) {
      try { await navigator.share({ title: lesson.title, url }) } catch { /* отменили — ок */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setManual(url)
    }
  }
  // Поле появилось — сразу выделяем его целиком, чтобы осталось одно движение.
  useEffect(() => {
    if (manual && manualRef.current) manualRef.current.select()
  }, [manual])
  return (
    <div className="shrink-0">
      <button
        onClick={share}
        title={t.shareTitle}
        className="w-full text-xs px-2.5 py-[13px] -my-[7px] sm:py-1.5 sm:my-0 rounded-md border border-black/10 text-gray-600 hover:bg-black/5 transition-colors"
      >
        {copied ? t.shareCopied : t.share}
      </button>
      {manual && (
        <div className="mt-1.5 text-[11px] text-gray-500">
          {t.shareManual}
          <input
            ref={manualRef}
            readOnly
            value={manual}
            onFocus={(e) => e.target.select()}
            className="mt-1 w-64 max-w-full px-1.5 py-1 rounded border border-black/10 bg-white font-mono text-[11px] text-gray-700"
          />
        </div>
      )}
    </div>
  )
}

// Полоса прогресса по курсу. Вынесена отдельно, потому что на десктопе стоит
// в сайдбаре, а на мобильном — под уроком, чтобы не отжимать виджет вниз.
function ProgressCard({ completed, total, t }) {
  const pct = Math.round((completed.size / total) * 100)
  return (
    <div className="rounded-xl border border-black/10 bg-panel/70 p-4">
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-900">{t.progress}</span>
        <span className="text-gray-500">{t.done(completed.size, total)}</span>
      </div>
      <div className="h-2 rounded-full bg-black/10 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Боковое оглавление с прогрессом: видно, где ты среди всех уроков,
// что пройдено (галочки) и сколько осталось (полоса прогресса).
function Sidebar({ activeModule, lessonId, globalIdx, completed, onModule, onLesson, locale, t }) {
  const [open, setOpen] = useState(false) // раскрытие списка уроков на мобильном
  const total = lessons.length
  const cur = lessons[globalIdx]
  const currentTitle = cur ? localizedLesson(cur, locale).title : ''
  // на мобильном после выбора урока список сворачиваем — сразу видно контент
  const selectLesson = (l) => { onLesson(l); setOpen(false) }
  return (
    <aside className="md:sticky md:top-20 md:self-start">
      {/* На мобильном карточка прогресса живёт под уроком (см. ProgressCard
          ниже по странице): она занимала ~60px над виджетом, а виджет и без
          того начинался почти на два экрана вниз. */}
      <div className="hidden md:block">
        <ProgressCard completed={completed} total={total} t={t} />
      </div>

      {/* мобильный переключатель: сворачивает/разворачивает список уроков */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="md:hidden mt-3 w-full flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-panel/70 px-3 py-[11px] text-sm text-gray-700"
      >
        <span className="truncate text-left"><span className="text-gray-400 mr-1.5">{open ? t.collapse : t.toc} ·</span>{currentTitle}</span>
        <span className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>▾</span>
      </button>

      <nav className={`${open ? 'block' : 'hidden'} md:block mt-3 md:mt-4 max-h-[60vh] md:max-h-none overflow-auto pr-1`}>
        <ol className="space-y-1">
          {moduleIds.map((mId) => {
            const list = lessonsByModule[mId] ?? []
            const ready = list.length > 0
            const isActive = mId === activeModule
            return (
              <li key={mId}>
                <button
                  onClick={() => ready && onModule(mId)}
                  disabled={!ready}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                    isActive ? 'bg-accent/15 text-cyanink font-medium' : ready ? 'text-gray-700 hover:bg-black/5' : 'text-gray-400 cursor-default'
                  }`}
                >
                  <span className="tabular-nums text-gray-400 mr-1.5">{mId}.</span>
                  {t.modules[mId]} <span className="opacity-70" aria-hidden>{moduleIcons[mId]}</span>
                  {!ready && <span className="ml-1.5 text-xs text-gray-400">{t.soon}</span>}
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
                            <span>{localizedLesson(l, locale).title}</span>
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
  const { search, hash } = useLocation()
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const [completed, setCompleted] = useState(saved.completed)

  // Урок задаётся URL-ом (/stats/:lessonSlug) — так уроки можно шарить
  // и добавлять в закладки. Модуль всегда следует за текущим уроком.
  const globalIdx = validIds.has(lessonSlug) ? lessons.findIndex((l) => l.id === lessonSlug) : -1
  const currentRu = globalIdx >= 0 ? lessons[globalIdx] : null
  const current = currentRu ? localizedLesson(currentRu, locale) : null
  const prev = globalIdx > 0 ? lessons[globalIdx - 1] : null
  const next = globalIdx >= 0 && globalIdx < lessons.length - 1 ? lessons[globalIdx + 1] : null
  const activeModule = current?.module ?? null

  // Полный текст урока грузится отдельным чанком: в индексе лежат только
  // заголовки и модули. Пока чанк едет, каркас страницы уже отрисован —
  // меняется одна колонка, а не вся страница.
  const [full, setFull] = useState(null)
  const currentId = current?.id
  useEffect(() => {
    if (!currentId) { setFull(null); return }
    let alive = true
    loadLesson(currentId, locale).then((l) => { if (alive) setFull(l) })
    // Гонку гасим флагом: при быстром переключении уроков ответ на прошлый
    // запрос мог прийти позже и подменить уже открытый урок.
    return () => { alive = false }
  }, [currentId, locale])

  // Голый /stats или неизвестный slug → на последний открытый (или первый) урок.
  // Сохраняем query/hash (проверка Метрики, utm-метки) при авторедиректе.
  useEffect(() => {
    if (!current) navigate(`${p}/stats/${loadProgress().lessonId}${search}${hash}`, { replace: true })
  }, [current, navigate, search, hash, p])

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
    document.title = `${current.title} — ${locale === 'en' ? 'DataSlice' : '«Кусочек пиццы»'}`
    return () => { document.title = t.docTitle }
  }, [current, locale, t])

  function markComplete(id) {
    if (completed.has(id)) return
    track('lesson_complete', { id })
    setCompleted((prevSet) => new Set(prevSet).add(id))
  }

  function goLesson(l) {
    navigate(`${p}/stats/${l.id}`)
  }
  function goModule(mId) {
    const first = lessonsByModule[mId]?.[0]
    if (first) goLesson(first)
  }

  if (!current) return null
  const nextLoc = next ? localizedLesson(next, locale) : null
  const prevLoc = prev ? localizedLesson(prev, locale) : null

  return (
    <div>
      {/* Раздел-эйбрау: не конкурирует с заголовком урока (который теперь h1).
          Хлебные крошки читаются как «Раздел → Модуль → Урок».
          Строка-оффер («N бесплатных интерактивных уроков…») отсюда убрана:
          её смысл переехал на лендинг, а на уроке она была лишней и отодвигала
          виджет ещё дальше вниз по странице. */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-gray-500">{t.statsH1}</div>
      </div>

      <div className="md:grid md:grid-cols-[248px_minmax(0,1fr)] md:gap-8">
        <Sidebar
          activeModule={activeModule}
          lessonId={current.id}
          globalIdx={globalIdx}
          completed={completed}
          onModule={goModule}
          onLesson={goLesson}
          locale={locale}
          t={t}
        />

        {/* flex + order на мобильном: подпись модуля и «поделиться» уезжают
            под урок, чтобы виджет попал в первый экран. На md+ порядок обычный. */}
        <div className="min-w-0 mt-8 md:mt-0 flex flex-col md:block">
          <div className="order-2 md:order-none mt-6 md:mt-0 text-xs text-gray-500 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span><span aria-hidden>{moduleIcons[current.module]}</span> {t.module(current.module, t.modules[current.module])}</span>
            <ShareButton lesson={current} locale={locale} t={t} />
          </div>

          <div className="order-3 md:hidden">
            <ProgressCard completed={completed} total={lessons.length} t={t} />
          </div>

          {full?._untranslated && (
            <div className="order-1 md:order-none mb-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.08] px-4 py-2.5 text-sm text-gray-700">
              {t.untranslated}
            </div>
          )}

          <div className="order-1 md:order-none">
            {full ? (
              <LessonLayout
                lesson={full}
                locale={locale}
                onComplete={() => markComplete(current.id)}
                onNext={next ? () => goLesson(next) : undefined}
              />
            ) : (
              // Заголовок из индекса рисуем сразу: он уже есть, и страница
              // не выглядит пустой, пока едет чанк с текстом урока.
              <article className="max-w-7xl">
                <h1 className="text-left text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3">{current.title}</h1>
                <div className="min-h-[60vh]" aria-hidden />
              </article>
            )}
          </div>

          <nav className="order-4 md:order-none mt-12 pt-5 border-t border-black/10 flex justify-between gap-3">
            {prevLoc ? (
              <button onClick={() => goLesson(prev)} className="text-left text-sm text-gray-700 hover:text-cyanink max-w-[45%]">
                <div className="text-gray-500 text-xs">{t.prevArrow}</div>
                {prevLoc.title}
              </button>
            ) : <span />}
            {nextLoc ? (
              <button onClick={() => goLesson(next)} className="text-right text-sm text-gray-700 hover:text-cyanink max-w-[45%]">
                <div className="text-gray-500 text-xs">{t.nextArrow}</div>
                {nextLoc.title}
              </button>
            ) : <span />}
          </nav>
          <div className="order-5 md:order-none mt-10">
            {next
              ? <SubscribeCTA locale={locale} />
              : <SubscribeCTA locale={locale} heading={t.ctaFinalHeading} text={t.ctaFinalText} />}
          </div>
        </div>
      </div>
    </div>
  )
}
