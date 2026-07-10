import { useState } from 'react'
import { Link } from 'react-router-dom'
import { glossary } from '../content/glossary.js'
import { glossaryEn } from '../content/glossary-en.js'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { useLocale, prefix, STR } from '../lib/i18n.js'

export default function GlossaryPage() {
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const data = locale === 'en' ? glossaryEn : glossary
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  // Ищем по названию, определению и синонимам (рус/англ/аббревиатуры).
  const matches = (t) =>
    !query ||
    t.term.toLowerCase().includes(query) ||
    t.def.toLowerCase().includes(query) ||
    (t.aliases || []).some((a) => a.toLowerCase().includes(query))

  const groups = data
    .map((g) => ({ group: g.group, terms: g.terms.filter(matches) }))
    .filter((g) => g.terms.length > 0)

  return (
    <div>
      {/* Список терминов держим узким (читаемая строка), а CTA ниже — на всю
          ширину контента, как на уроках и /metrics. */}
      <div className="max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t.glossaryH1}</h1>
      <p className="text-gray-600 mb-5">{t.glossarySub}</p>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.glossarySearch}
        className="w-full mb-6 bg-ink border border-black/15 rounded-md px-3 py-2 text-sm focus:border-accent/50 outline-none"
      />

      {groups.length === 0 && (
        <div className="text-gray-500 text-sm">
          {t.glossaryEmpty}{' '}
          <Link to={`${p}/metrics`} className="text-cyanink hover:underline">{t.glossaryEmptyLink}</Link>.
        </div>
      )}

      {groups.map((g) => (
        <section key={g.group} className="mb-8">
          <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-3">{g.group}</div>
          <dl className="space-y-3">
            {g.terms.map((term) => (
              <div key={term.term}>
                <dt className="text-gray-900 font-medium">
                  {term.term}
                  {term.lesson && (
                    <Link
                      to={`${p}/stats/${term.lesson}`}
                      className="ml-2 text-xs font-normal text-cyanink hover:underline"
                    >
                      {t.glossaryLesson}
                    </Link>
                  )}
                </dt>
                <dd className="text-sm text-gray-600 leading-snug">{term.def}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      </div>

      {/* Как на уроках и /metrics: путь к подписке замыкает страницу — на всю ширину. */}
      <div className="mt-10">
        <SubscribeCTA locale={locale} />
      </div>
    </div>
  )
}
