import { Suspense, lazy, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { glossary } from '../content/glossary.js'
import { glossaryEn } from '../content/glossary-en.js'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { useLocale, prefix, STR } from '../lib/i18n.js'

// Карта «метрика → индустрия» подставляется при сборке (см. vite.config.js):
// карточка живёт внутри дерева, поэтому ссылке нужен ещё и id индустрии.
const METRIC_INDUSTRY = __METRIC_INDUSTRY__

// Отдельным чанком: KaTeX тянет ~296 KB, а глоссарий должен открываться быстро.
const Formula = lazy(() => import('../components/Formula.jsx'))

// Якорь секции из названия группы. Группы русские и английские, поэтому
// транслитерацией не заморачиваемся — берём кодовые точки, лишь бы стабильно.
const slug = (s) => 'g-' + [...s.toLowerCase()].map((c) => (/[a-z0-9]/.test(c) ? c : c.charCodeAt(0).toString(36))).join('')

export default function GlossaryPage() {
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const data = locale === 'en' ? glossaryEn : glossary
  // ?q= приходит из поиска по сайту: термин без разбора в уроке открывается
  // здесь, и строка должна быть уже заполнена — иначе человек попадает
  // в общий список из 83 терминов и ищет заново.
  const [params, setParams] = useSearchParams()
  const [q, setQRaw] = useState(params.get('q') || '')
  const setQ = (v) => {
    setQRaw(v)
    // запрос живёт в адресе: ссылку на выдачу можно отправить как есть
    const next = new URLSearchParams(params)
    if (v.trim()) next.set('q', v)
    else next.delete('q')
    setParams(next, { replace: true })
  }
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
      {/* До lg список узкий — читаемая строка. На широком экране разворачиваем
          и раскладываем в две колонки: при 1440px правая половина пустовала. */}
      <div className="max-w-3xl lg:max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t.glossaryH1}</h1>
      <p className="text-gray-600 mb-5">{t.glossarySub}</p>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.glossarySearch}
        className="w-full max-w-3xl mb-6 bg-ink border border-black/15 rounded-md px-3 py-2 text-sm focus:border-accent/50 outline-none"
      />

      {groups.length === 0 && (
        <div className="text-gray-500 text-sm">
          {t.glossaryEmpty}{' '}
          <Link to={`${p}/metrics`} className="text-cyanink hover:underline">{t.glossaryEmptyLink}</Link>.
        </div>
      )}

      {/* Якорная навигация по группам: список из 74 терминов вытягивался почти
          на 5000px, и добраться до «Бизнес-метрик» можно было только скроллом. */}
      {groups.length > 1 && (
        <nav className="flex flex-wrap gap-2 mb-6">
          {groups.map((g) => (
            <a
              key={g.group}
              href={`#${slug(g.group)}`}
              className="text-xs px-2.5 py-2 sm:py-1 rounded-full border border-black/10 text-gray-600 hover:bg-black/5 transition-colors"
            >
              {g.group} <span className="text-gray-400">{g.terms.length}</span>
            </a>
          ))}
        </nav>
      )}

      {groups.map((g) => (
        <section key={g.group} id={slug(g.group)} className="mb-8 scroll-mt-24">
          <h2 className="text-xs uppercase tracking-wider text-cyanink/80 mb-3">{g.group}</h2>
          {/* На широком экране — две колонки: правая половина пустовала,
              а список шёл одной лентой. break-inside-avoid не даёт термину
              разорваться между колонками. */}
          {/* Интервал между записями крупный: у термина теперь до трёх частей
              (название, определение, формула), и при тесном шаге формула
              зрительно прилипала к следующему термину. */}
          {/* Отступ задаём margin-bottom на самих записях, а не утилитой
              space-y: её правило `> * + *` перебивает mb-* по специфичности,
              и в две колонки интервал обнулялся. */}
          <dl className="lg:columns-2 lg:gap-10">
            {g.terms.map((term) => (
              <div key={term.term} className="break-inside-avoid mb-7">
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
                  {/* Ссылка на карточку метрики: рядом с глоссарием лежат
                      формулы и готовый SQL, но раздел «Бизнес-метрики» вёл в
                      никуда — из 43 терминов ссылку имел один. */}
                  {term.metric && METRIC_INDUSTRY[term.metric] && (
                    <Link
                      to={`${p}/metrics?tab=industries&ind=${METRIC_INDUSTRY[term.metric]}&metric=${term.metric}`}
                      className="ml-2 text-xs font-normal text-cyanink hover:underline"
                    >
                      {t.glossaryMetric}
                    </Link>
                  )}
                </dt>
                <dd className="text-sm text-gray-600 leading-relaxed mt-0.5">{term.def}</dd>
                {/* Формула — только там, где она реально проясняет термин.
                    KaTeX (296 KB) грузится лениво: до его прихода строка видна
                    как обычный моноширинный текст, читать глоссарий это не мешает. */}
                {term.formula && (
                  <dd className="mt-2 text-[13px] text-cyanink">
                    <Suspense fallback={<span className="font-mono">{term.formula}</span>}>
                      <Formula tex={term.formula} />
                    </Suspense>
                  </dd>
                )}
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
