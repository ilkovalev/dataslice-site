import { useState } from 'react'
import { Link } from 'react-router-dom'
import { glossary } from '../content/glossary.js'

export default function GlossaryPage() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  // Ищем по названию, определению и синонимам (рус/англ/аббревиатуры).
  const matches = (t) =>
    !query ||
    t.term.toLowerCase().includes(query) ||
    t.def.toLowerCase().includes(query) ||
    (t.aliases || []).some((a) => a.toLowerCase().includes(query))

  const groups = glossary
    .map((g) => ({ group: g.group, terms: g.terms.filter(matches) }))
    .filter((g) => g.terms.length > 0)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Глоссарий</h1>
      <p className="text-gray-600 mb-5">Термины статистики и бизнес-метрики — в одном месте.</p>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск термина — можно по-русски и по-английски…"
        className="w-full mb-6 bg-ink border border-black/15 rounded-md px-3 py-2 text-sm focus:border-accent/50 outline-none"
      />

      {groups.length === 0 && (
        <div className="text-gray-500 text-sm">
          Ничего не найдено. Про метрики загляните в раздел{' '}
          <Link to="/metrics" className="text-cyanink hover:underline">«Основы» иерархий метрик</Link>.
        </div>
      )}

      {groups.map((g) => (
        <section key={g.group} className="mb-8">
          <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-3">{g.group}</div>
          <dl className="space-y-3">
            {g.terms.map((t) => (
              <div key={t.term}>
                <dt className="text-gray-900 font-medium">
                  {t.term}
                  {t.lesson && (
                    <Link
                      to={`/stats/${t.lesson}`}
                      className="ml-2 text-xs font-normal text-cyanink hover:underline"
                    >
                      → разобрано в уроке
                    </Link>
                  )}
                </dt>
                <dd className="text-sm text-gray-600 leading-snug">{t.def}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
