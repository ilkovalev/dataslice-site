import { useEffect, useState } from 'react'
import { widgets } from './widgets.js'
import Paragraphs from './Paragraphs.jsx'
import { gloss } from './Glossed.jsx'

// Урок в beats-модели: один постоянный виджет + последовательность «бит».
// Каждый бит — проза + состояние/подсветка виджета + опц. предсказание→раскрытие.
// Виджеты с собственной кнопкой «сбросить» — общую не показываем (без дублей).
const OWN_RESET = new Set([
  'bootstrap', 'center-measures', 'coin-flips', 'confidence-intervals', 'distribution',
  'estimator-sampler', 'histogram', 'peeking', 'sampling-distribution', 'sequential-test', 'two-teams',
])

export default function BeatsLesson({ lesson }) {
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  useEffect(() => setRevealed(false), [i])

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
    <article className="max-w-6xl">
      <h2 className="text-left text-2xl font-semibold mb-3">{lesson.title}</h2>
      {lesson.intro && <p className="text-gray-700 leading-relaxed mb-6 max-w-[68ch]">{gloss(lesson.intro)}</p>}

      <div className={Widget ? 'grid md:grid-cols-3 gap-8 items-start' : ''}>
        {Widget && (
          <div className="min-w-0 md:col-span-2 md:sticky md:top-20">
            {showGenericReset && (
              <div className="flex justify-end mb-1">
                <button
                  onClick={() => setResetKey((k) => k + 1)}
                  title="Вернуть график к исходному состоянию"
                  className="text-xs px-2 py-0.5 rounded border border-black/10 text-gray-500 hover:bg-black/5"
                >
                  ↺ сбросить график
                </button>
              </div>
            )}
            <Widget key={`${widgetId}-${resetKey}`} {...widgetProps} highlight={beat.widget?.highlight} />
          </div>
        )}

        <div className={Widget ? '' : 'max-w-[68ch]'}>
          <div className="flex gap-1.5 mb-4">
            {lesson.beats.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Шаг ${k + 1}`}
                className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-accent' : 'w-3 bg-black/12 hover:bg-black/20'}`}
              />
            ))}
          </div>

          <p className="text-gray-900 leading-relaxed mb-4">{gloss(beat.text)}</p>

          {beat.predict && (
            <div className="rounded-lg border border-black/10 bg-ink/60 p-3 mb-4">
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">Предскажите</div>
              <p className="text-sm text-gray-700">{beat.predict}</p>
              {!revealed && (
                <button
                  onClick={() => setRevealed(true)}
                  className="mt-2 text-xs px-2.5 py-1 rounded border border-accent/40 text-cyanink hover:bg-accent/10"
                >
                  Показать ответ
                </button>
              )}
            </div>
          )}

          {beat.reveal && (!beat.predict || revealed) && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="text-gray-700">Ответ:</span> {gloss(beat.reveal)}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              disabled={i === 0}
              onClick={() => setI(i - 1)}
              className="text-sm text-gray-500 disabled:opacity-30 hover:text-gray-800 transition-colors"
            >
              ← Назад
            </button>
            {!last && (
              <button
                onClick={() => setI(i + 1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity"
              >
                Дальше <span aria-hidden>→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {lesson.definitions && (
        <div className="max-w-2xl mt-10">
          <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">Определения</div>
          <dl className="space-y-3">
            {lesson.definitions.map((d) => (
              <div key={d.term} className="text-sm">
                <div>
                  <span className="text-gray-900 font-medium">{d.term}</span>
                  {d.formula && <span className="font-mono text-cyanink ml-2">{d.formula}</span>}
                </div>
                <div className="text-gray-600 leading-relaxed">{d.text}</div>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="max-w-2xl mt-10">
        <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{lesson.practiceTitle || 'Что это значит'}</div>
        <Paragraphs text={lesson.practice} className="text-gray-700 leading-relaxed" />
        {lesson.realLife && (
          <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-sky-600/90 mb-2">{lesson.realLifeTitle || 'Где это встречается'}</div>
            <Paragraphs text={lesson.realLife} className="text-sm text-gray-700 leading-relaxed" />
          </div>
        )}
        {lesson.assumptions && (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-amber-600 mb-2">Когда метод врёт (допущения)</div>
            <Paragraphs text={lesson.assumptions} className="text-sm text-gray-700 leading-relaxed" />
          </div>
        )}
        {lesson.deepDive && (
          <details className="mt-4 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3">
            <summary className="cursor-pointer text-sm text-cyanink select-none">Подробный разбор: математика и механизм (необязательно)</summary>
            <div className="mt-2">
              <Paragraphs text={lesson.deepDive} className="text-sm text-gray-700 leading-relaxed" />
            </div>
          </details>
        )}
        {lesson.nextLabel && (
          <div className="mt-6 pt-4 border-t border-black/10 text-sm text-gray-600">
            Дальше → <span className="text-cyanink">{lesson.nextLabel}</span>
          </div>
        )}
      </div>
    </article>
  )
}
