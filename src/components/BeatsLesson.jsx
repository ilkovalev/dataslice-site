import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { widgets } from './widgets.js'
import Paragraphs from './Paragraphs.jsx'
import Formula from './Formula.jsx'
import { gloss } from './Glossed.jsx'
import { STR, prefix } from '../lib/i18n.js'

// Урок в beats-модели: один постоянный виджет + последовательность «бит».
// Каждый бит — проза + состояние/подсветка виджета + опц. предсказание→раскрытие.
// Виджеты с собственной кнопкой «сбросить» — общую не показываем (без дублей).
const OWN_RESET = new Set([
  'bayes-grid', 'bootstrap', 'center-measures', 'coin-flips', 'confidence-intervals', 'distribution',
  'estimator-sampler', 'events-probability', 'histogram', 'outlier-actions', 'peeking', 'percentile-explorer',
  'random-variable', 'sampling-distribution', 'sequential-test', 'two-teams',
])

export default function BeatsLesson({ lesson, locale = 'ru', onComplete, onNext }) {
  const t = STR[locale]
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const widgetRef = useRef(null)
  const summaryRef = useRef(null)
  useEffect(() => setRevealed(false), [i])
  // Урок считается пройденным, когда читатель дошёл до последнего бита.
  useEffect(() => {
    if (i === lesson.beats.length - 1) onComplete?.()
  }, [i, lesson, onComplete])
  // Стрелки ←/→ листают биты (если фокус не в поле ввода).
  useEffect(() => {
    function onKey(e) {
      if (e.target.closest?.('input, textarea, select')) return
      if (e.key === 'ArrowRight' && i < lesson.beats.length - 1) setI(i + 1)
      if (e.key === 'ArrowLeft' && i > 0) setI(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [i, lesson])

  const beat = lesson.beats[i] ?? lesson.beats[0]
  // Бит может нести свой виджет (beat.widget.name) и доп. props — иначе берём
  // постоянный виджет урока. Так в одном уроке живёт несколько интерактивов.
  const widgetId = beat.widget?.name || lesson.widget
  const Widget = widgets[widgetId]
  const widgetProps = { ...(lesson.widgetProps || {}), ...(beat.widget?.props || {}) }
  const last = i === lesson.beats.length - 1
  // У этих виджетов есть СВОЯ кнопка «сбросить» — общую не дублируем.
  const showGenericReset = Widget && !OWN_RESET.has(widgetId)

  return (
    <article className="max-w-7xl lesson-enter">
      <h2 className="text-left text-2xl md:text-3xl font-bold tracking-tight mb-3">{lesson.title}</h2>
      {lesson.intro && <p className="text-gray-700 leading-relaxed mb-6 max-w-[68ch]">{gloss(lesson.intro)}</p>}

      <div className={Widget ? 'grid md:grid-cols-3 gap-8 items-start' : ''}>
        {Widget && (
          <div ref={widgetRef} className="min-w-0 md:col-span-2 md:sticky md:top-20 scroll-mt-16">
            {showGenericReset && (
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setResetKey((k) => k + 1)}
                  title={t.resetChartTitle}
                  className="text-xs px-2 py-0.5 rounded-md border border-black/10 text-gray-500 hover:bg-black/5"
                >
                  {t.resetChart}
                </button>
              </div>
            )}
            {/* Double-Bezel: виджет-«стекло» в мягком «алюминиевом» лотке */}
            <div className="rounded-[1.15rem] bg-black/[0.04] ring-1 ring-black/5 p-1.5 shadow-[0_10px_36px_rgba(32,36,46,0.07)]">
              <Widget key={`${widgetId}-${resetKey}`} {...widgetProps} locale={locale} highlight={beat.widget?.highlight} />
            </div>
          </div>
        )}

        <div className={Widget ? '' : 'max-w-[68ch]'}>
          <div className="flex gap-1.5 mb-4">
            {lesson.beats.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={t.step(k + 1)}
                className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-accent' : 'w-3 bg-black/12 hover:bg-black/20'}`}
              />
            ))}
          </div>

          {/* min-height, чтобы кнопки не прыгали по вертикали между битами */}
          <div className="min-h-[11rem]">
            <p className="text-gray-900 leading-relaxed mb-4">{gloss(beat.text)}</p>

            {beat.predict && (
              <div className="rounded-lg border border-black/10 bg-ink/60 p-3 mb-4">
                <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{t.predict}</div>
                <p className="text-sm text-gray-700">{beat.predict}</p>
                {!revealed && (
                  <button
                    onClick={() => setRevealed(true)}
                    className="mt-2 text-xs px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10"
                  >
                    {t.revealAnswer}
                  </button>
                )}
              </div>
            )}

            {beat.reveal && (!beat.predict || revealed) && (
              <p className="text-sm text-gray-600 mb-4">
                <span className="text-gray-700">{t.answer}</span> {gloss(beat.reveal)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              disabled={i === 0}
              onClick={() => setI(i - 1)}
              className="text-sm text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
            >
              {t.back}
            </button>
            {!last && (
              <button
                onClick={() => setI(i + 1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-cyanink text-white hover:opacity-90 transition-opacity"
              >
                {t.next} <span aria-hidden>→</span>
              </button>
            )}
            {last && (
              <button
                onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-cyanink text-white hover:opacity-90 transition-opacity"
              >
                {t.lessonSummary} <span aria-hidden>↓</span>
              </button>
            )}
            {Widget && (
              <button
                onClick={() => widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="md:hidden text-xs text-cyanink hover:underline"
              >
                {t.toChart}
              </button>
            )}
          </div>
          <div className="mt-2 hidden md:block text-[11px] text-gray-400">{t.arrowsHint}</div>
        </div>
      </div>

      <div ref={summaryRef} className="scroll-mt-16 mt-10">
        {/* Итог урока в две колонки на десктопе — чтобы заполнить ширину, а не жаться слева */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          {/* Левая колонка: смысл и применение */}
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{lesson.practiceTitle || t.whatItMeans}</div>
              {lesson.decision && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-emerald-700 mb-1.5">{t.decisionLabel}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{lesson.decision}</p>
                </div>
              )}
              <Paragraphs text={lesson.practice} className="text-gray-700 leading-relaxed" />
            </div>
            {lesson.realLife && (
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-sky-600/90 mb-2">{lesson.realLifeTitle || t.whereItAppears}</div>
                <Paragraphs text={lesson.realLife} className="text-sm text-gray-700 leading-relaxed" />
              </div>
            )}
          </div>

          {/* Правая колонка: определения и оговорки */}
          <div className="space-y-6 mt-6 lg:mt-0">
            {lesson.definitions && (
              <details open className="group">
                <summary className="cursor-pointer select-none list-none flex items-center gap-1.5 text-xs uppercase tracking-wider text-cyanink/80 mb-2">
                  <span aria-hidden className="text-[9px] transition-transform group-open:rotate-90">▶</span>
                  {t.definitions}
                </summary>
                <dl className="space-y-3">
                  {lesson.definitions.map((d) => (
                    <div key={d.term} className="text-sm">
                      <div>
                        <span className="text-gray-900 font-medium">{d.term}</span>
                        {d.formula && <Formula tex={d.formula} className="text-cyanink ml-2" />}
                      </div>
                      <div className="text-gray-600 leading-relaxed">{d.text}</div>
                      {d.simple && <div className="text-sky-700/90 italic mt-0.5">{t.simple} {d.simple}</div>}
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {lesson.assumptions && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-amber-600 mb-2">{t.whenItLies}</div>
                <Paragraphs text={lesson.assumptions} className="text-sm text-gray-700 leading-relaxed" />
              </div>
            )}
            {lesson.deepDive && (
              <details className="rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3">
                <summary className="cursor-pointer text-sm text-cyanink select-none">{t.deepDive}</summary>
                <div className="mt-2">
                  <Paragraphs text={lesson.deepDive} className="text-sm text-gray-700 leading-relaxed" />
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Навигация — на всю ширину под колонками */}
        {(lesson.related || lesson.nextLabel) && (
          <div className="mt-8">
            {lesson.related && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">{t.seeAlso}</span>
                {lesson.related.map((r) => (
                  <Link
                    key={r.id}
                    to={`${prefix(locale)}/stats/${r.id}`}
                    className="text-xs px-2.5 py-1 rounded-full border border-accent/30 text-cyanink hover:bg-accent/10 transition-colors"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
            {lesson.nextLabel && (
              <div className="mt-6 pt-4 border-t border-black/10 text-sm text-gray-600 max-w-3xl">
                {t.nextLabel}{' '}
                {onNext ? (
                  <button onClick={onNext} className="text-left text-cyanink hover:underline">
                    {lesson.nextLabel}
                  </button>
                ) : (
                  <span className="text-cyanink">{lesson.nextLabel}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
