import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Formula from './Formula.jsx'
import SqlBlock from './SqlBlock.jsx'
import { gloss } from './Glossed.jsx'
import { ExampleBlock, Pitfalls, SectionLabel } from './MetricDetails.jsx'
import { useLocale, STR, loc } from '../lib/i18n.js'
import { track } from '../lib/analytics.js'

// Детальная карточка метрики: формула, описание, SQL, подводные камни.
// Открывается по клику на узел дерева или на метрику фреймворка. Данные — из справочника
// (catalog, по node.metricId) с возможным контекстным override в node.detail.
// На десктопе — модалка по центру, на мобильных — bottom-sheet.
// Кейс с числами живёт в глоссарии; в карточку подставляется при сборке
// (vite.config.js), чтобы карточка была не беднее глоссария.
const METRIC_CASES = __METRIC_CASES__

export default function MetricCardModal({ node, catalog, categories, onClose, contextLabel }) {
  const locale = useLocale()
  const t = STR[locale]
  // related-чипы заменяют содержимое карточки на соседнюю метрику каталога;
  // контекст узла (note) при этом уже не показываем.
  const [view, setView] = useState({ node, metricId: node?.metricId })
  const closeRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  useEffect(() => {
    if (view.metricId) track('metric_card_open', { id: view.metricId })
  }, [view.metricId])

  const metric = view.metricId ? catalog?.[view.metricId] : null
  const n = view.node
  const pick = (field) => n?.detail?.[field] ?? metric?.[field]

  const title = loc(pick('title'), locale) ?? n?.title
  const tex = loc(pick('tex'), locale)
  const desc = loc(pick('desc'), locale)
  const sql = pick('sql')
  const pitfalls = loc(pick('pitfalls'), locale)
  const example = view.metricId ? METRIC_CASES[view.metricId]?.[locale] : null
  const related = metric?.related?.filter((id) => catalog?.[id]) ?? []
  const category = metric && categories?.[metric.category]
  const isLever = n?.kind === 'lever' && !metric
  const isGroup = n?.kind === 'group' && !metric

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]" onClick={onClose} />
      {/* Стеклянный лист в стиле глоссария: шапка без плотной полосы,
          разделы — плитками, одинаковые с глоссарием блоки «Пример» и
          «Подводные камни» (MetricDetails.jsx). */}
      <div className="glass relative w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] overflow-y-auto bg-[#fffdf9]/90 rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-2xl sm:mx-4">
        <div className="sticky top-0 z-10 px-6 pt-5 pb-4 bg-[#fffdf9]/85 backdrop-blur-xl border-b border-black/[0.05] flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* Заголовок — без тултипов: карточка сама и есть определение метрики,
                а подсветка слов в названии превращает его в пестрядь ссылок. */}
            <div className="text-xl font-semibold tracking-tight text-gray-900 leading-snug">{title}</div>
            {category && (
              <span className="glass-pill inline-block mt-2 text-xs text-cyanink rounded-full px-2.5 py-0.5">
                {loc(category, locale)}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t.metricCardClose}
            className="glass-pill shrink-0 h-9 w-9 grid place-items-center rounded-full text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 space-y-5">
          {isLever && (
            <div className="rounded-2xl border border-sky-500/30 bg-sky-50/70 px-4 py-3 text-sm text-gray-700">{t.metricCardLever}</div>
          )}
          {isGroup && (
            <div className="rounded-2xl bg-white/60 ring-1 ring-white/80 px-4 py-3 text-sm text-gray-600">{t.metricCardGroup}</div>
          )}

          {desc && <div className="text-[15px] text-gray-800 leading-relaxed">{gloss(desc)}</div>}

          {!metric && n?.note && !desc && (
            <div className="text-[15px] text-gray-800 leading-relaxed">{gloss(n.note)}</div>
          )}

          {tex && (
            <div>
              <SectionLabel>{t.metricCardFormula}</SectionLabel>
              <div className="rounded-2xl bg-white/70 ring-1 ring-white/80 shadow-[0_2px_10px_-6px_rgba(20,50,80,0.18)] px-4 py-3 text-[15px] text-cyanink overflow-x-auto">
                <Formula tex={tex} />
              </div>
            </div>
          )}

          <ExampleBlock label={t.metricExample} text={example} />

          {sql && (
            <div>
              <SectionLabel>{t.metricCardSql}</SectionLabel>
              <SqlBlock sql={sql} copyLabel={t.metricCardCopy} copiedLabel={t.metricCardCopied} selectedLabel={t.metricCardSelected} />
              {/* Схема таблиц свёрнута: серый абзац из семи таблиц под каждым
                  запросом читался как шум. */}
              <details className="mt-1.5 group">
                <summary className="cursor-pointer select-none text-xs text-gray-400 hover:text-gray-600 list-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-block transition-transform group-open:rotate-90 mr-1">›</span>
                  {t.metricCardSchemaToggle}
                </summary>
                <div className="mt-1 text-[11px] text-gray-500 leading-snug">{t.metricCardSchema}</div>
              </details>
            </div>
          )}

          <Pitfalls label={t.metricCardPitfalls} items={pitfalls} />

          {metric && n?.note && (
            <div className="rounded-2xl bg-white/60 ring-1 ring-white/80 px-4 py-3 text-sm text-gray-600">
              <span className="text-gray-900 font-medium">{contextLabel ?? t.metricCardInTree}:</span> {gloss(n.note)}
            </div>
          )}

          {related.length > 0 && (
            <div>
              <SectionLabel>{t.metricCardRelated}</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {related.map((id) => (
                  <button
                    key={id}
                    onClick={() => setView({ node: null, metricId: id })}
                    className="text-sm px-3 py-1 glass-pill rounded-full text-cyanink"
                  >
                    {loc(catalog[id].title, locale)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
