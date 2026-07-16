import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Formula from './Formula.jsx'
import SqlBlock from './SqlBlock.jsx'
import { gloss } from './Glossed.jsx'
import { useLocale, STR, loc } from '../lib/i18n.js'
import { track } from '../lib/analytics.js'

// Детальная карточка метрики: формула, описание, SQL, подводные камни.
// Открывается по клику на узел дерева. Данные берутся из справочника
// (catalog, по node.metricId) с возможным контекстным override в node.detail.
// На десктопе — модалка по центру, на мобильных — bottom-sheet.
export default function MetricCardModal({ node, catalog, categories, onClose }) {
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
  const related = metric?.related?.filter((id) => catalog?.[id]) ?? []
  const category = metric && categories?.[metric.category]
  const isLever = n?.kind === 'lever' && !metric
  const isGroup = n?.kind === 'group' && !metric

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[88vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-black/10 sm:mx-4">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-5 pt-4 pb-3 border-b border-black/10 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* Заголовок — без тултипов: карточка сама и есть определение метрики,
                а подсветка слов в названии превращает его в пестрядь ссылок. */}
            <div className="text-lg font-semibold text-gray-900 leading-snug">{title}</div>
            {category && (
              <span className="inline-block mt-1 text-[11px] uppercase tracking-wider text-cyanink bg-accent/10 border border-accent/30 rounded px-1.5 py-0.5">
                {loc(category, locale)}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t.metricCardClose}
            className="shrink-0 rounded-md border border-black/10 px-2 py-1 text-sm text-gray-500 hover:text-gray-900 hover:bg-black/5"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {isLever && (
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 px-3.5 py-2.5 text-sm text-gray-700">{t.metricCardLever}</div>
          )}
          {isGroup && (
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-gray-600">{t.metricCardGroup}</div>
          )}

          {tex && (
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t.metricCardFormula}</div>
              <div className="rounded-lg bg-accent/[0.07] border border-accent/20 px-3.5 py-2.5 text-[15px] text-cyanink overflow-x-auto">
                <Formula tex={tex} />
              </div>
            </div>
          )}

          {desc && <div className="text-[15px] text-gray-700 leading-relaxed">{gloss(desc)}</div>}

          {!metric && n?.note && !desc && (
            <div className="text-[15px] text-gray-700 leading-relaxed">{gloss(n.note)}</div>
          )}

          {sql && (
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t.metricCardSql}</div>
              <SqlBlock sql={sql} copyLabel={t.metricCardCopy} copiedLabel={t.metricCardCopied} />
              <div className="mt-1.5 text-[11px] text-gray-400 leading-snug">{t.metricCardSchema}</div>
            </div>
          )}

          {pitfalls?.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">{t.metricCardPitfalls}</div>
              <ul className="space-y-1.5">
                {pitfalls.map((p, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed pl-4 relative">
                    <span className="absolute left-0 text-amber-600">▪</span>
                    {gloss(p)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {metric && n?.note && (
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-gray-600">
              <span className="text-gray-900 font-medium">{t.metricCardInTree}:</span> {gloss(n.note)}
            </div>
          )}

          {related.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1.5">{t.metricCardRelated}</div>
              <div className="flex flex-wrap gap-1.5">
                {related.map((id) => (
                  <button
                    key={id}
                    onClick={() => setView({ node: null, metricId: id })}
                    className="text-sm px-2.5 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10"
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
