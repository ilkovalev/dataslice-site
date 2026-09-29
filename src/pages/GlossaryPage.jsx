import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { glossary } from '../content/glossary.js'
import { glossaryEn } from '../content/glossary-en.js'
import { glossarySql } from '../content/glossarySql.js'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import SqlBlock from '../components/SqlBlock.jsx'
import { ExampleBlock, Pitfalls, SectionLabel } from '../components/MetricDetails.jsx'
import { glossaryPitfalls } from '../content/glossaryPitfalls.js'
import { useLocale, prefix, STR } from '../lib/i18n.js'

// Подводные камни и связанные метрики из каталога — те же, что в карточке
// метрики (см. vite.config.js). Глоссарий не должен быть беднее карточки.
const GLOSSARY_METRICS = __GLOSSARY_METRICS__

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
  // ?q= приходит из поиска по сайту и из пунктов роудмапа: термин без разбора
  // в уроке открывается здесь, и строка должна быть уже заполнена — иначе
  // человек попадает в общий список из сотни терминов и ищет заново.
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

  // Какой раздел открыт. Раздел — вкладка: четыре раздела одной лентой
  // читались как портянка из 120 терминов. Храним индекс, а не название:
  // названия у локалей разные, а вкладка должна пережить переключение языка.
  // Адрес раздела и категории — в хэше (#g-…), чтобы ссылкой можно было
  // поделиться; по нему же выбирается вкладка.
  const { hash } = useLocation()
  const navigate = useNavigate()
  const anchorGroup = {}
  data.forEach((g, i) => {
    anchorGroup[slug(g.group)] = i
    g.categories?.forEach((c) => (anchorGroup[`g-${c.id}`] = i))
    // якорь отдельного термина (#t-…) — из «Связанных метрик» и внешних ссылок
    g.terms.forEach((term) => term.id && (anchorGroup[`t-${term.id}`] = i))
  })
  const hashId = decodeURIComponent(hash.slice(1))
  const [tab, setTab] = useState(() => anchorGroup[hashId] ?? 0)
  useEffect(() => {
    if (anchorGroup[hashId] !== undefined) setTab(anchorGroup[hashId])
  }, [hashId]) // eslint-disable-line react-hooks/exhaustive-deps
  // Прокрутка к якорю — после того, как нужная вкладка отрисовалась.
  // Без этого ссылка вида /glossary#g-audience открывалась в начале страницы.
  // Клик по вкладке тоже пишет якорь в адрес, но прокручивать к нему не надо:
  // страница уезжала вниз к началу раздела, хотя вкладки и так на экране.
  const tabClick = useRef(false)
  const tabsRef = useRef(null)
  useEffect(() => {
    if (tabClick.current) return
    if (hashId) document.getElementById(hashId)?.scrollIntoView()
  }, [hashId, tab])

  // Ищем по названию, определению и синонимам (рус/англ/аббревиатуры).
  const matches = (t) =>
    !query ||
    t.term.toLowerCase().includes(query) ||
    t.def.toLowerCase().includes(query) ||
    (t.aliases || []).some((a) => a.toLowerCase().includes(query))

  const groups = data.map((g, i) => {
    const terms = g.terms.filter(matches)
    const cats = g.categories
      ?.map((c) => ({ ...c, terms: terms.filter((term) => term.cat === c.id) }))
      .filter((c) => c.terms.length)
    return { i, group: g.group, terms, cats }
  })
  // При поиске вкладки не нужны: показываем все совпадения сразу, по разделам.
  const shown = query ? groups.filter((g) => g.terms.length) : [groups[tab] ?? groups[0]]
  const current = groups[tab] ?? groups[0]

  // Подсветка текущей категории в оглавлении слева. Текущая — последняя,
  // чей заголовок уже ушёл под шапку (IntersectionObserver путался
  // при длинных прыжках по якорям).
  const [active, setActive] = useState(null)
  useEffect(() => {
    const onScroll = () => {
      let cur = null
      for (const el of document.querySelectorAll('[data-sec]')) {
        if (el.getBoundingClientRect().top <= 140) cur = el.dataset.sec
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [query, locale, tab])

  // Связанные метрики — термины этого же глоссария, чтобы ссылка вела рядом.
  const byId = {}
  data.forEach((g) => g.terms.forEach((term) => term.id && (byId[term.id] = term)))
  const related = (term) => (GLOSSARY_METRICS[term.metric]?.related ?? []).map((id) => byId[id]).filter(Boolean)

  // Одна запись глоссария. У бизнес-метрик под раскрывающимся полем — короткий
  // кейс с числами и SQL-расчёт: определение без примера отвечает «что это»,
  // но не «как это выглядит в данных».
  const renderTerm = (term) => (
    <div
      key={term.term}
      id={term.id ? `t-${term.id}` : undefined}
      className="min-w-0 py-4 border-t border-black/[0.06] scroll-mt-40 lg:scroll-mt-24"
    >
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
      {term.case && glossarySql[term.id] && (
        <dd className="mt-2.5">
          <details className="group">
            <summary className="glass-pill inline-flex items-center gap-1.5 cursor-pointer select-none rounded-full px-3 py-1 text-xs text-gray-600 hover:text-cyanink group-open:text-cyanink transition-colors list-none [&::-webkit-details-marker]:hidden">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
              {t.glossaryCase}
            </summary>
            <div className="mt-3 space-y-4">
              <ExampleBlock label={t.metricExample} text={term.case} />
              <div>
                <SectionLabel>{t.metricCardSql}</SectionLabel>
                <SqlBlock sql={glossarySql[term.id]} copyLabel={t.metricCardCopy} copiedLabel={t.metricCardCopied} selectedLabel={t.metricCardSelected} />
              </div>
              <Pitfalls
                label={t.metricCardPitfalls}
                items={GLOSSARY_METRICS[term.metric]?.pitfalls?.[locale] ?? glossaryPitfalls[term.id]?.[locale]}
              />
              {related(term).length > 0 && (
                <div>
                  <SectionLabel>{t.metricCardRelated}</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {related(term).map((r) => (
                      <a key={r.id} href={`#t-${r.id}`} className="glass-pill text-sm px-3 py-1 rounded-full text-cyanink">
                        {r.term}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        </dd>
      )}
    </div>
  )

  const stepBadge = (step, size = 'h-6 w-6 text-xs') =>
    step ? (
      <span className={`${size} shrink-0 inline-flex items-center justify-center rounded-full bg-gradient-to-b from-accent/25 to-accent/10 ring-1 ring-white/70 font-semibold text-cyanink`}>
        {step}
      </span>
    ) : null

  // Категория — отдельная стеклянная карточка: мелкого подзаголовка не
  // хватало, категории сливались в одну ленту. Шапка без серой плашки —
  // плашка делала блок похожим на таблицу из админки.
  const renderPanel = (c, terms) => (
    <div
      key={c ? c.id : 'all'}
      id={c ? `g-${c.id}` : undefined}
      data-sec={c ? `g-${c.id}` : undefined}
      className="glass mb-5 scroll-mt-40 lg:scroll-mt-24 rounded-3xl px-5 sm:px-7 pt-5 pb-2"
    >
      {c && (
        <div className="flex items-start gap-3 pb-3">
          {c.step && <span className="mt-0.5">{stepBadge(c.step, 'h-7 w-7 text-sm')}</span>}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">
              {c.title} <span className="text-sm font-normal text-gray-400">{terms.length}</span>
            </h3>
            {c.desc && <p className="text-sm text-gray-500 leading-snug">{c.desc}</p>}
          </div>
        </div>
      )}
      {/* На всю ширину одна колонка давала строки по 150+ символов, поэтому
          с xl термины идут в две колонки. Раскрытый пример остаётся в своей
          колонке: растягивание на обе с dense-раскладкой переставляло соседние
          термины, и при клике блоки прыгали. */}
      <dl className="xl:grid xl:grid-cols-2 xl:gap-x-12 xl:items-start">{terms.map(renderTerm)}</dl>
    </div>
  )

  const openTab = (i) => {
    // вкладку и адрес меняем в одном обработчике — одна перерисовка;
    // флаг снимаем после неё, иначе вторая перерисовка всё же прокручивала
    tabClick.current = true
    setTab(i)
    requestAnimationFrame(() => requestAnimationFrame(() => (tabClick.current = false)))
    navigate({ hash: `#${slug(data[i].group)}`, search: params.toString() }, { replace: true })
    // Если вкладки уже прокручены за шапку (переключают из середины длинного
    // раздела), поднимаем их обратно на экран — иначе новый раздел открылся
    // бы где-то в середине.
    const top = tabsRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) window.scrollBy({ top: top - 120 })
  }

  return (
    <div>
      <div>
        {/* Заголовок, поиск и вкладки — над сеткой, на всю ширину: раньше
            оглавление слева приходилось опускать до уровня карточек,
            и над ним висела пустота. */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{t.glossaryH1}</h1>
        <p className="text-gray-600 mb-6">{t.glossarySub}</p>

        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <label className="glass-pill flex items-center gap-2 rounded-full px-4 py-2.5 md:w-96 shrink-0 focus-within:ring-2 focus-within:ring-accent/40">
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.glossarySearch}
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </label>
          {!query && (
            <div ref={tabsRef} role="tablist" className="glass-segment flex flex-1 gap-1 p-1 rounded-full overflow-x-auto">
              {groups.map((g) => (
                <button
                  key={g.group}
                  role="tab"
                  aria-selected={g.i === current.i}
                  onClick={() => openTab(g.i)}
                  className={`shrink-0 md:flex-1 whitespace-nowrap text-sm px-4 py-1.5 rounded-full transition-colors ${
                    g.i === current.i ? 'glass-pill text-cyanink font-medium' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {g.group} <span className="text-gray-400 font-normal">{g.terms.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* Оглавление — категории открытого раздела. При поиске его нет:
              выдача короткая и идёт по всем разделам. */}
          <aside className="hidden lg:block sticky top-24">
            {!query && current.cats && (
              <nav className="glass rounded-3xl p-3 flex flex-col gap-0.5">
                <div className="px-2.5 pt-1 pb-2 text-xs uppercase tracking-wider text-gray-400">{current.group}</div>
                {current.cats.map((c) => (
                  <a
                    key={c.id}
                    href={`#g-${c.id}`}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm transition-colors ${
                      active === `g-${c.id}` ? 'glass-pill text-cyanink' : 'text-gray-700 hover:bg-white/50 border border-transparent'
                    }`}
                  >
                    {/* пустое место под номер — только если в разделе есть нумерованные категории */}
                    {stepBadge(c.step, 'h-5 w-5 text-[11px]') ||
                      (current.cats.some((x) => x.step) && <span className="h-5 w-5 shrink-0" />)}
                    <span className="flex-1">{c.title}</span>
                    <span className="text-gray-400">{c.terms.length}</span>
                  </a>
                ))}
              </nav>
            )}
          </aside>

          <div className="min-w-0">
            {query && shown.length === 0 && (
              <div className="text-gray-500 text-sm">
                {t.glossaryEmpty}{' '}
                <Link to={`${p}/metrics`} className="text-cyanink hover:underline">{t.glossaryEmptyLink}</Link>.
              </div>
            )}

            {shown.map((g) => (
              <section key={g.group} id={slug(g.group)} className="mb-10 scroll-mt-40 lg:scroll-mt-24">
                {query && <h2 className="text-xl font-semibold text-gray-900 mb-3">{g.group}</h2>}
                {/* На телефоне оглавления сбоку нет — категории чипами с прокруткой вбок. */}
                {!query && g.cats && (
                  <nav className="flex gap-2 mb-5 -mx-4 px-4 py-1 overflow-x-auto lg:hidden">
                    {g.cats.map((c) => (
                      <a
                        key={c.id}
                        href={`#g-${c.id}`}
                        className="glass-pill shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-full text-gray-700"
                      >
                        {stepBadge(c.step, 'h-4 w-4 text-[10px]')}
                        {c.title} <span className="text-gray-400">{c.terms.length}</span>
                      </a>
                    ))}
                  </nav>
                )}
                {!query && data[g.i].categories?.some((c) => c.step) && (
                  <p className="text-sm text-gray-500 mb-4 px-1">{t.glossaryLifecycle}</p>
                )}
                {g.cats ? g.cats.map((c) => renderPanel(c, c.terms)) : renderPanel(null, g.terms)}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Как на уроках и /metrics: путь к подписке замыкает страницу — на всю ширину. */}
      <div className="mt-10">
        <SubscribeCTA locale={locale} />
      </div>
    </div>
  )
}
