import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricTreeGraph from '../components/MetricTreeGraph.jsx'
import MetricPyramid from '../components/MetricPyramid.jsx'
import Framework from '../components/Framework.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { industries, resolveIndustry } from '../content/industries/index.js'
import { useLocale, STR } from '../lib/i18n.js'

export default function MetricsPage() {
  const locale = useLocale()
  const t = STR[locale]
  const [mode, setMode] = useState('basics') // basics | industries — вводная первой
  const [activeId, setActiveId] = useState(industries[0].id)
  const [companyId, setCompanyId] = useState(null)
  const [view, setView] = useState('tree') // tree | pyramid
  // Деревья хранятся в двуязычной схеме {ru, en} — резолвим в строки локали.
  const localized = useMemo(() => industries.map((i) => resolveIndustry(i, locale)), [locale])
  const active = localized.find((i) => i.id === activeId)
  const company = active.companies?.find((c) => c.id === companyId)

  // Резолвим, что показывать: своё дерево компании или базовое индустрии.
  const resolved = company
    ? { root: company.root, counterMetrics: company.counterMetrics, pyramid: company.pyramid, northStar: company.northStar }
    : { root: active.root, counterMetrics: active.counterMetrics, pyramid: active.pyramid, northStar: active.northStar }

  function goIndustry(id) {
    setActiveId(id)
    setCompanyId(null)
    setMode('industries')
  }

  const tab = (m, label) => (
    <button onClick={() => setMode(m)} className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${mode === m ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-700 hover:bg-black/5'}`}>{label}</button>
  )
  const viewBtn = (v, label) => (
    <button onClick={() => setView(v)} className={`text-xs px-2.5 py-1 rounded-md border ${view === v ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{label}</button>
  )

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t.metricsH1}</h1>
      {/* Число направлений считаем из данных: индустрии добавляются, а текст
          с прибитой цифрой начинает врать молча. */}
      {locale === 'en' ? (
        <p className="text-gray-600 mb-4 max-w-3xl">Start with <span className="text-cyanink">Basics</span>, then open <span className="text-cyanink">Industries</span>: ready-made metric trees for {industries.length} verticals with real-company breakdowns.</p>
      ) : (
        <p className="text-gray-600 mb-4 max-w-3xl">Начните с вкладки <span className="text-cyanink">«Основы»</span> — что такое метрики, какие они бывают и как выстраивать иерархии. Затем переходите в <span className="text-cyanink">«Индустрии»</span> — готовые деревья по {industries.length} направлениям с разбором по компаниям.</p>
      )}
      {t.metricsNotice && (
        <div className="mb-4 rounded-lg border border-amber-400/40 bg-amber-400/[0.08] px-4 py-2.5 text-sm text-gray-700 max-w-3xl">{t.metricsNotice}</div>
      )}

      <div className="flex gap-2 mb-6">
        {tab('basics', locale === 'en' ? 'Basics' : 'Основы')}
        {tab('industries', locale === 'en' ? 'Industries' : 'Индустрии')}
      </div>

      {mode === 'basics' && <Framework industries={localized} onPick={goIndustry} />}

      {mode === 'industries' && (<>
        {/* Все индустрии видны сразу — чипами, а не спрятаны в выпадашке */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {localized.map((ind) => (
            <button
              key={ind.id}
              onClick={() => goIndustry(ind.id)}
              title={ind.archetype}
              className={`text-sm px-3 py-1 rounded-md border transition-colors ${
                ind.id === activeId ? 'border-accent/50 text-cyanink bg-accent/15 font-medium' : 'border-black/10 text-gray-600 hover:bg-black/5'
              }`}
            >
              {ind.industry}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mb-4">
          {viewBtn('tree', locale === 'en' ? 'Tree' : 'Дерево')}
          {viewBtn('pyramid', locale === 'en' ? 'Pyramid' : 'Пирамида')}
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-4">
          <div>
            <div className="text-xs text-gray-500">North Star {company ? `· ${company.name}` : `· ${t.metricsBaseModel}`}</div>
            <div className="text-cyanink font-medium">{resolved.northStar}</div>
          </div>
          {active.companies && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCompanyId(null)} className={`text-sm px-3 py-1 rounded-md border ${!companyId ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{t.metricsBase}</button>
              {active.companies.map((c) => (
                <button key={c.id} onClick={() => setCompanyId(c.id)} className={`text-sm px-3 py-1 rounded-md border ${c.id === companyId ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{c.name}</button>
              ))}
            </div>
          )}
        </div>

        {company && (
          <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-2.5 text-sm text-gray-700">
            <span className="text-sky-600 font-medium">{company.name}:</span> {company.note}{' '}
            <span className="text-gray-500">
              {locale === 'en'
                ? 'This company has its own hierarchy — switch back and forth and compare the tree structure.'
                : 'У этой компании своя иерархия — переключайтесь и сравнивайте структуру дерева.'}
            </span>
          </div>
        )}

        {view === 'tree' && <MetricTreeGraph tree={resolved} />}
        {view === 'pyramid' && <MetricPyramid tree={resolved} />}
      </>)}

      <div className="mt-8 rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-gray-600 leading-relaxed">
        {locale === 'en' ? (
          <>
            <span className="text-gray-900">Where statistics comes in:</span> a metric went up — check it wasn’t by chance (<Link to="/en/stats" className="text-cyanink hover:underline">A/B and the t-test</Link>); revenue means lie because of long tails — use the median (<Link to="/en/stats" className="text-cyanink hover:underline">distributions and skew</Link>); optimizing a single number — keep counter-metrics (<Link to="/en/stats" className="text-cyanink hover:underline">Goodhart’s law</Link>).
          </>
        ) : (
          <>
            <span className="text-gray-900">Связь со статистикой:</span> метрика выросла — проверьте, что не случайно (<Link to="/stats" className="text-cyanink hover:underline">A/B и t-тест</Link>); среднее по выручке обманывает из-за длинного хвоста — берите медиану (<Link to="/stats" className="text-cyanink hover:underline">распределения и скос</Link>); оптимизируете одно число — держите контр-метрики (<Link to="/stats" className="text-cyanink hover:underline">закон Гудхарта</Link>).
          </>
        )}
      </div>

      <div className="mt-6">
        <SubscribeCTA locale={locale} />
      </div>
    </div>
  )
}
