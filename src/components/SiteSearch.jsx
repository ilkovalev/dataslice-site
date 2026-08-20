import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STR, prefix, useLocale } from '../lib/i18n.js'
import { track } from '../lib/analytics.js'
import { loadSearchIndex } from '../content/searchIndex.js'

// Поиск по всему сайту: темы курса, термины глоссария, бизнес-метрики.
// Раньше искать можно было только внутри глоссария, и человек, пришедший
// со словом «сезонность» или «MAPE», не находил ни урока, ни метрики.
//
// Индекс грузится своим чанком при первом открытии (см. content/searchIndex.js):
// в основном чанке ему делать нечего — большинство посетителей поиск не откроют.

const GROUPS = ['l', 'g', 'm']
const MAX_PER_GROUP = 6

// Совпадение ищем по началу слова, а не по любой подстроке: «сезон» должно
// находить «сезонность», но «она» не должно находить «сезонность» и «воронка».
function scoreOf(entry, query) {
  const inWord = (text) => {
    if (!text) return 0
    const t = text.toLowerCase()
    const at = t.indexOf(query)
    if (at < 0) return 0
    if (at === 0) return 2 // с начала строки — самое сильное совпадение
    return /[\s·,.()/-]/.test(t[at - 1]) ? 1 : 0 // с начала слова
  }
  const title = inWord(entry.t)
  if (title) return 100 + title * 10 + Math.max(0, 30 - entry.t.length)
  const words = inWord(entry.w)
  if (words) return 60 + words * 5
  const lead = inWord(entry.s)
  if (lead) return 30 + lead * 2
  return 0
}

export default function SiteSearch({ open, onClose }) {
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const navigate = useNavigate()
  const [index, setIndex] = useState(null)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Чанк индекса едет только при первом открытии; дальше он уже в памяти.
  useEffect(() => {
    if (!open || index) return
    let alive = true
    loadSearchIndex(locale).then((data) => { if (alive) setIndex(data) })
    return () => { alive = false }
  }, [open, index, locale])

  useEffect(() => {
    if (open) {
      setCursor(0)
      // autoFocus не годится: поле появляется вместе с оверлеем, и фокус
      // успевает уехать на кнопку, с которой поиск открыли
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const query = q.trim().toLowerCase()
  const results = useMemo(() => {
    const data = index
    if (!data || query.length < 2) return []
    const scored = []
    for (const e of data) {
      const s = scoreOf(e, query)
      if (s) scored.push({ e, s })
    }
    scored.sort((a, b) => b.s - a.s)
    // Держим все три поверхности в выдаче: иначе 60 уроков вытесняют
    // единственную подходящую метрику, ради которой поиск и открывали.
    const out = []
    for (const g of GROUPS) {
      out.push(...scored.filter((x) => x.e.k === g).slice(0, MAX_PER_GROUP).map((x) => x.e))
    }
    return out
  }, [index, query])

  const linkFor = (e) => {
    if (e.k === 'l') return `${p}/stats/${e.id}`
    if (e.k === 'm') return e.ind ? `${p}/metrics?tab=industries&ind=${e.ind}&metric=${e.id}` : `${p}/metrics`
    if (e.lesson) return `${p}/stats/${e.lesson}`
    if (e.metric && e.ind) return `${p}/metrics?tab=industries&ind=${e.ind}&metric=${e.metric}`
    return `${p}/glossary?q=${encodeURIComponent(e.t)}`
  }

  const go = (e) => {
    if (!e) return
    track('search_go', { kind: e.k, q: query })
    navigate(linkFor(e))
    onClose()
  }

  useEffect(() => {
    if (!open) return
    function onKey(ev) {
      if (ev.key === 'Escape') return onClose()
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (ev.key === 'Enter') { ev.preventDefault(); go(results[cursor]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, cursor])

  // Выбранная строка не должна уезжать за край списка при навигации стрелками.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [cursor, results])

  if (!open) return null

  const label = { l: t.searchGroupLessons, g: t.searchGroupTerms, m: t.searchGroupMetrics }
  let lastGroup = null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-start justify-center p-4 pt-[10vh]"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div role="dialog" aria-modal="true" aria-label={t.searchButton} className="w-full max-w-2xl rounded-xl border border-black/10 bg-ink shadow-2xl overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setCursor(0) }}
          placeholder={t.searchPlaceholder}
          className="w-full px-4 py-3.5 text-[15px] bg-transparent border-b border-black/10 outline-none"
        />

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 && (
            <p className="px-4 py-6 text-sm text-gray-500">{t.searchHint}</p>
          )}
          {query.length >= 2 && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-500">{t.searchEmpty}</p>
          )}
          {results.map((e, i) => {
            const head = e.k !== lastGroup ? ((lastGroup = e.k), true) : false
            return (
              <div key={`${e.k}-${e.id || e.t}-${i}`}>
                {head && (
                  <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-gray-400">{label[e.k]}</div>
                )}
                <button
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(e)}
                  className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 ${i === cursor ? 'bg-accent/15' : 'hover:bg-black/5'}`}
                >
                  <span className="text-sm text-gray-900 flex items-baseline gap-2">
                    {e.t}
                    {e.k === 'l' && <span className="text-[11px] text-gray-400 shrink-0">{t.searchModule} {e.m}</span>}
                  </span>
                  {e.s && <span className="text-xs text-gray-500 line-clamp-1">{e.s}</span>}
                </button>
              </div>
            )
          })}
        </div>

        <div className="px-4 py-2 border-t border-black/10 text-[11px] text-gray-400 flex gap-4">
          <span>↑↓ {t.searchKeyMove}</span>
          <span>↵ {t.searchKeyOpen}</span>
          <span>esc {t.searchKeyClose}</span>
        </div>
      </div>
    </div>
  )
}
