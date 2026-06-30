import { useState } from 'react'
import { Link } from 'react-router-dom'
import MetricTreeGraph from '../components/MetricTreeGraph.jsx'
import MetricPyramid from '../components/MetricPyramid.jsx'
import Framework from '../components/Framework.jsx'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { industries } from '../content/industries/index.js'

// Группируем для <optgroup> в компактном выпадающем списке.
const archetypes = []
for (const ind of industries) {
  let g = archetypes.find((a) => a.name === ind.archetype)
  if (!g) { g = { name: ind.archetype, items: [] }; archetypes.push(g) }
  g.items.push(ind)
}

export default function MetricsPage() {
  const [mode, setMode] = useState('basics') // basics | industries — вводная первой
  const [activeId, setActiveId] = useState(industries[0].id)
  const [companyId, setCompanyId] = useState(null)
  const [view, setView] = useState('tree') // tree | pyramid
  const active = industries.find((i) => i.id === activeId)
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
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Метрики и их иерархии</h1>
      <p className="text-gray-600 mb-4">Начните с вкладки <span className="text-cyanink">«Основы»</span> — что такое метрики, какие они бывают и как выстраивать иерархии. Затем переходите в <span className="text-cyanink">«Индустрии»</span> — готовые деревья по 15 направлениям с разбором по компаниям.</p>

      <div className="flex gap-2 mb-6">
        {tab('basics', 'Основы')}
        {tab('industries', 'Индустрии')}
      </div>

      {mode === 'basics' && <Framework industries={industries} onPick={goIndustry} />}

      {mode === 'industries' && (<>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={activeId}
            onChange={(e) => goIndustry(e.target.value)}
            className="bg-ink border border-black/15 rounded-md px-3 py-2 text-sm min-w-[260px]"
          >
            {archetypes.map((g) => (
              <optgroup key={g.name} label={g.name}>
                {g.items.map((i) => <option key={i.id} value={i.id}>{i.industry}</option>)}
              </optgroup>
            ))}
          </select>
          <div className="flex gap-1">
            {viewBtn('tree', 'Дерево')}
            {viewBtn('pyramid', 'Пирамида')}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-4">
          <div>
            <div className="text-xs text-gray-500">North Star {company ? `· ${company.name}` : '· базовая модель'}</div>
            <div className="text-cyanink font-medium">{resolved.northStar}</div>
          </div>
          {active.companies && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCompanyId(null)} className={`text-sm px-3 py-1 rounded-md border ${!companyId ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>Базовая</button>
              {active.companies.map((c) => (
                <button key={c.id} onClick={() => setCompanyId(c.id)} className={`text-sm px-3 py-1 rounded-md border ${c.id === companyId ? 'border-accent/40 text-cyanink bg-accent/10' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{c.name}</button>
              ))}
            </div>
          )}
        </div>

        {company && (
          <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-2.5 text-sm text-gray-700">
            <span className="text-sky-600 font-medium">{company.name}:</span> {company.note} <span className="text-gray-500">У этой компании своя иерархия — переключайтесь и сравнивайте структуру дерева.</span>
          </div>
        )}

        {view === 'tree' && <MetricTreeGraph tree={resolved} />}
        {view === 'pyramid' && <MetricPyramid tree={resolved} />}
      </>)}

      <div className="mt-8 rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-gray-600 leading-relaxed">
        <span className="text-gray-900">Связь со статистикой:</span> метрика выросла — проверьте, что не случайно (<Link to="/stats" className="text-cyanink hover:underline">A/B и t-тест</Link>); среднее по выручке обманывает из-за длинного хвоста — берите медиану (<Link to="/stats" className="text-cyanink hover:underline">распределения и скос</Link>); оптимизируете одно число — держите контр-метрики (<Link to="/stats" className="text-cyanink hover:underline">закон Гудхарта</Link>).
      </div>

      <div className="mt-6">
        <SubscribeCTA />
      </div>
    </div>
  )
}
