import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import LessonLayout from '../components/LessonLayout.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { lessons, lessonsByModule } from '../content/lessons/index.js'
import { lessonsEnById } from '../content/lessons-en/index.js'
import { track } from '../lib/analytics.js'
import { useLocale, prefix, STR } from '../lib/i18n.js'

// Модули = части учебного пути (названия — в словаре i18n).
const moduleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const moduleIcons = { 1: '📊', 2: '🎲', 3: '🔔', 4: '🎯', 5: '⚖️', 6: '🧪', 7: '📈', 8: '🏷️', 9: '🪤', 10: '🔄', 11: '🧩', 12: '🏁' }

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

// Урок в текущей локали: для en берём перевод, если он есть,
// иначе русский оригинал с пометкой.
function localizedLesson(ruLesson, locale) {
  if (locale !== 'en') return ruLesson
  const en = lessonsEnById[ruLesson.id]
  if (en) return { ...ruLesson, ...en }
  return { ...ruLesson, _untranslated: true }
}

// Ссылка на урок: системный share на мобильном, копирование на десктопе.
function ShareButton({ lesson, locale, t }) {
  const [copied, setCopied] = useState(false)
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
    } catch { /* нет clipboard — молча */ }
  }
  return (
    <button
      onClick={share}
      title={t.shareTitle}
      className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border border-black/10 text-gray-600 hover:bg-black/5 transition-colors"
    >
      {copied ? t.shareCopied : t.share}
    </button>
  )
}

// Боковое оглавление с прогрессом: видно, где ты среди всех уроков,
// что пройдено (галочки) и сколько осталось (полоса прогресса).
function Sidebar({ activeModule, lessonId, globalIdx, completed, onModule, onLesson, locale, t }) {
  const [open, setOpen] = useState(false) // раскрытие списка уроков на мобильном
  const total = lessons.length
  const pct = Math.round((completed.size / total) * 100)
  const cur = lessons[globalIdx]
  const currentTitle = cur ? localizedLesson(cur, locale).title : ''
  // на мобильном после выбора урока список сворачиваем — сразу видно контент
  const selectLesson = (l) => { onLesson(l); setOpen(false) }
  return (
    <aside className="md:sticky md:top-20 md:self-start">
      <div className="rounded-xl border border-black/10 bg-panel/70 p-4">
        <div className="flex items-baseline justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-900">{t.progress}</span>
          <span className="text-gray-500">{t.done(completed.size, total)}</span>
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
          Хлебные крошки читаются как «Раздел → Модуль → Урок». */}
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-gray-500">{t.statsH1}</div>
        <p className="text-sm text-gray-500 leading-relaxed mt-0.5 max-w-2xl">{t.statsSub(lessons.length)}</p>
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

        <div className="min-w-0 mt-8 md:mt-0">
          <div className="text-xs text-gray-500 mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span><span aria-hidden>{moduleIcons[current.module]}</span> {t.module(current.module, t.modules[current.module])}</span>
            <ShareButton lesson={current} locale={locale} t={t} />
          </div>

          {current._untranslated && (
            <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.08] px-4 py-2.5 text-sm text-gray-700">
              {t.untranslated}
            </div>
          )}

          <LessonLayout
            lesson={current}
            locale={locale}
            onComplete={() => markComplete(current.id)}
            onNext={next ? () => goLesson(next) : undefined}
          />

          <nav className="mt-12 pt-5 border-t border-black/10 flex justify-between gap-3">
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
          <div className="mt-10">
            {next
              ? <SubscribeCTA locale={locale} />
              : <SubscribeCTA locale={locale} heading={t.ctaFinalHeading} text={t.ctaFinalText} />}
          </div>
        </div>
      </div>
    </div>
  )
}
