import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MetricCardModal from './MetricCardModal.jsx'
import { gloss } from './Glossed.jsx'
import { useLocale, STR, loc } from '../lib/i18n.js'
import { AARRR_BY_KEY, HEART_BY_KEY } from '../content/frameworks.js'

// Третий срез раздела «Индустрии» — рядом с деревом и пирамидой.
// Дерево раскладывает North Star на множители, пирамида группирует метрики по
// аудитории, фреймворк — по этапу жизненного цикла (AARRR) или по стороне
// качества (HEART). Смысл вида в том, что стадия задаёт вопрос, а индустрия
// отвечает на него конкретными метриками: не «вовлечённость», а «сессий в день»
// с определением того, что именно считается.

// Справочник метрик и сами разборы грузятся лениво и кэшируются на модуль:
// оба нужны только тому, кто открыл этот вид, и в чанке страницы им не место.
let catalogCache = null
const loadCatalog = () =>
  import('../content/metrics/index.js').then((m) => {
    catalogCache = { byId: m.metricsById, categories: m.METRIC_CATEGORIES }
    return catalogCache
  })

let fwCache = null
const loadFrameworks = () =>
  import('../content/industries/frameworks/index.js').then((m) => {
    fwCache = m.frameworksById
    return fwCache
  })

// С определением метрика — карточка (определение и есть то, ради чего вид
// делали). Без определения — чип: пустая карточка в полколонки выглядит как
// незаполненные данные, хотя в HEART смысл несут строки «Цель» и «Сигнал».
function MetricItem({ m, catalog, locale, onOpen }) {
  const card = catalog?.byId?.[m.metricId]
  const title = loc(m.label, locale) ?? (card ? loc(card.title, locale) : m.metricId)
  const def = loc(m.def, locale)
  if (!def) {
    return (
      <button
        onClick={() => onOpen(m, title)}
        className="text-left rounded-xl bg-white/60 ring-1 ring-white/70 px-2.5 py-1 text-[13px] text-gray-900 hover:ring-accent/40 hover:text-cyanink transition-colors"
      >
        {title}
      </button>
    )
  }
  return (
    <button
      onClick={() => onOpen(m, title)}
      className="text-left rounded-xl bg-white/60 ring-1 ring-white/70 px-3 py-2 hover:ring-accent/40 hover:shadow-sm transition-colors w-full"
    >
      <span className="block text-[13px] font-medium text-gray-900 leading-snug">{title}</span>
      <span className="block text-xs text-gray-600 leading-snug mt-1">{gloss(def)}</span>
    </button>
  )
}

export default function MetricFramework({ industry }) {
  const locale = useLocale()
  const t = STR[locale]
  const [frameworks, setFrameworks] = useState(fwCache)
  const fw = frameworks?.[industry.id]
  const [kind, setKind] = useState('aarrr')
  const [catalog, setCatalog] = useState(catalogCache)
  const [selected, setSelected] = useState(null)
  const [sp, setSp] = useSearchParams()

  // Разборы нужны прямо сейчас — этот вид без них пустой.
  useEffect(() => {
    if (fwCache) return
    let alive = true
    loadFrameworks().then((f) => alive && setFrameworks(f))
    return () => { alive = false }
  }, [])

  // Каталог — в свободное время: он нужен только при клике на метрику.
  useEffect(() => {
    if (catalogCache) return
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 400))
    const id = idle(() => loadCatalog().then(setCatalog))
    return () => (window.cancelIdleCallback ?? clearTimeout)(id)
  }, [])

  // Смена индустрии закрывает открытую карточку: иначе всплывает метрика из
  // прошлой вертикали с чужим определением.
  useEffect(() => { setSelected(null) }, [industry.id])

  const patch = (next) => {
    const p = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '') p.delete(k)
      else p.set(k, v)
    }
    setSp(p, { replace: true })
  }

  const openCard = (m, title) => {
    // Карточку собираем из записи фреймворка: заголовок вертикали, определение
    // «как это считается здесь» и metricId для формулы и SQL из каталога.
    setSelected({ id: `${kind}-${m.metricId}`, title, note: loc(m.def, locale), metricId: m.metricId })
    patch({ metric: m.metricId })
    if (!catalogCache) loadCatalog().then(setCatalog)
  }
  const closeCard = () => { setSelected(null); patch({ metric: null }) }

  if (!fw) {
    return (
      <div className="glass rounded-3xl p-5 text-sm text-gray-600 min-h-[6rem]">
        {frameworks ? t.fwNoData : ''}
      </div>
    )
  }

  const block = kind === 'aarrr' ? fw.aarrr : fw.heart
  const rows = kind === 'aarrr' ? block.stages : block.dims
  const meta = (r) => (kind === 'aarrr' ? AARRR_BY_KEY[r.key] : HEART_BY_KEY[r.key])

  const kindBtn = (k, label) => (
    <button
      onClick={() => setKind(k)}
      className={`text-xs px-2.5 py-1 rounded-full ${
        kind === k ? 'glass-pill text-cyanink font-medium' : 'border border-white/80 bg-white/55 shadow-[0_1px_3px_rgba(20,40,60,0.07)] text-gray-600 hover:bg-white/75'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {kindBtn('aarrr', 'AARRR')}
        {kindBtn('heart', 'HEART')}
        <span className="text-xs text-gray-500 ml-auto">{t.fwHintClick}</span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-3xl">{gloss(loc(block.note, locale))}</p>

      <div className="space-y-3">
        {rows.map((r) => {
          const m = meta(r)
          if (!m) return null
          return (
            <div key={r.key} className="rounded-2xl bg-white/45 ring-1 ring-white/70 p-3 sm:p-4">
              <div className="sm:grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-5">
                <div className="mb-3 sm:mb-0">
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 w-6 h-6 rounded-md bg-accent/15 border border-accent/30 text-cyanink text-xs font-mono grid place-items-center">
                      {m.letter}
                    </span>
                    <span className="text-sm font-medium text-cyanink leading-snug">{loc(m.name, locale)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 leading-snug">
                    {loc(kind === 'aarrr' ? m.question : m.about, locale)}
                  </div>
                </div>

                <div>
                  {kind === 'aarrr' ? (
                    <p className="text-[13px] text-gray-700 leading-snug mb-2.5">{gloss(loc(r.note, locale))}</p>
                  ) : (
                    <dl className="text-[13px] leading-snug mb-2.5 space-y-1">
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-gray-500 w-14">{t.fwGoal}</dt>
                        <dd className="text-gray-700">{gloss(loc(r.goal, locale))}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0 text-gray-500 w-14">{t.fwSignal}</dt>
                        <dd className="text-gray-700">{gloss(loc(r.signal, locale))}</dd>
                      </div>
                    </dl>
                  )}
                  <div className={r.metrics.some((mm) => mm.def) ? 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-wrap gap-2'}>
                    {r.metrics.map((mm) => (
                      <MetricItem key={mm.metricId} m={mm} catalog={catalog} locale={locale} onOpen={openCard} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <MetricCardModal
          node={selected}
          catalog={catalog?.byId}
          categories={catalog?.categories}
          contextLabel={t.fwInIndustry}
          onClose={closeCard}
        />
      )}
    </div>
  )
}
