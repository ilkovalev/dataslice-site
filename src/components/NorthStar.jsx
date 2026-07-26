import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MetricTreeGraph from './MetricTreeGraph.jsx'
import { gloss } from './Glossed.jsx'
import { useLocale, loc, prefix } from '../lib/i18n.js'
import { NS_CONTENT, NSM_TYPES, NS_DEMO_TREE } from '../content/northstar.js'

// Блок про North Star Metric во вкладке «Основы»: что это, три вида,
// критерии, input vs output, интерактивная декомпозиция до 6 уровня,
// закон Гудхарта и переходы в индустрии.

// Резолвер {ru,en} для демо-дерева — то же, что делает resolveIndustry
// для индустрий, но локально: дерево живёт в northstar.js.
function resolveNode(n, l) {
  return {
    ...n,
    title: loc(n.title, l),
    note: loc(n.note, l),
    formula: loc(n.formula, l),
    children: n.children?.map((c) => resolveNode(c, l)),
  }
}

export default function NorthStar({ industries, onPick }) {
  const locale = useLocale()
  const t = NS_CONTENT[locale]
  const [openType, setOpenType] = useState('transaction')

  const tree = useMemo(
    () => ({
      root: resolveNode(NS_DEMO_TREE.root, locale),
      counterMetrics: NS_DEMO_TREE.counterMetrics.map((c) => ({ title: loc(c.title, locale), note: loc(c.note, locale) })),
    }),
    [locale]
  )

  const byId = Object.fromEntries(industries.map((i) => [i.id, i]))

  return (
    <section className="space-y-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:items-start">
        <div>
          <h2 className="text-lg font-medium mb-2">{t.heading}</h2>
          <div className="text-[15px] text-gray-700 leading-relaxed space-y-3">
            {t.intro.map((p, i) => (
              <p key={i}>{gloss(p)}</p>
            ))}
          </div>
        </div>

        {/* Input → NSM → выручка: схема-шпаргалка, как «Анатомия иерархии» */}
        <aside className="mt-6 lg:mt-0 rounded-xl border border-black/10 bg-panel p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">{t.ioHeading}</div>
          <div className="space-y-2">
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/[0.07] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-sky-700">{t.ioInput.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.ioInput.d}</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↓</div>
            <div className="rounded-lg border border-accent/40 bg-accent/12 px-3.5 py-2.5">
              <div className="text-sm font-semibold text-cyanink">{t.ioNsm.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.ioNsm.d}</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↓</div>
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-gray-700">{t.ioRevenue.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.ioRevenue.d}</div>
            </div>
          </div>
        </aside>
      </div>

      <div>
        <h3 className="text-base font-medium mb-1">{t.typesHeading}</h3>
        <p className="text-gray-600 text-sm mb-3 max-w-3xl">{t.typesIntro}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {NSM_TYPES.map((ty) => (
            <button
              key={ty.id}
              onClick={() => setOpenType(ty.id)}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                ty.id === openType ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-700 hover:bg-black/5'
              }`}
            >
              {loc(ty.title, locale)}
            </button>
          ))}
        </div>
        {NSM_TYPES.filter((ty) => ty.id === openType).map((ty) => (
          <div key={ty.id} className="rounded-xl border border-black/10 bg-panel p-5">
            <div className="text-lg text-cyanink font-medium">{loc(ty.title, locale)}</div>
            <div className="text-sm text-gray-600 mt-2">{t.typeMetric}</div>
            <div className="font-mono text-sm text-cyanink/90 bg-accent/10 inline-block px-2 py-0.5 rounded mb-3">{loc(ty.metric, locale)}</div>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-3">{gloss(loc(ty.desc, locale))}</p>
            <div className="text-sm text-gray-600 mb-1">
              {t.typeExamples}: <span className="text-gray-900">{loc(ty.examples, locale)}</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {t.typeWhen}: <span className="text-gray-900">{loc(ty.when, locale)}</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">{t.typeIndustries}:</div>
            <div className="flex flex-wrap gap-2">
              {ty.industries.filter((id) => byId[id]).map((id) => (
                <button
                  key={id}
                  onClick={() => onPick(id)}
                  className="text-sm px-3 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10"
                >
                  {byId[id].industry} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">{t.criteriaHeading}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {t.criteria.map((c) => (
            <div key={c.t} className="rounded-lg border border-black/10 bg-panel px-4 py-3">
              <div className="text-cyanink font-medium text-sm">{c.t}</div>
              <div className="text-sm text-gray-600 mt-1 leading-relaxed">{gloss(c.d)}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-1">{t.ioHeading}</h3>
        <div className="text-[15px] text-gray-700 leading-relaxed space-y-3 max-w-3xl">
          {t.ioText.map((p, i) => (
            <p key={i}>{gloss(p)}</p>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-1">{t.treeHeading}</h3>
        <p className="text-gray-600 text-sm mb-3 max-w-3xl">{t.treeIntro}</p>
        {/* Демо-дерево узкое (4 листа) — показываем все 6 уровней сразу:
            текст рядом обещает именно их. */}
        <MetricTreeGraph tree={tree} defaultDepth={99} />
      </div>

      <div>
        <h3 className="text-base font-medium mb-1">{t.goodhartHeading}</h3>
        <div className="text-[15px] text-gray-700 leading-relaxed space-y-3 max-w-3xl">
          {t.goodhartText.map((p, i) => (
            <p key={i}>{gloss(p)}</p>
          ))}
          <p>
            <Link to={`${prefix(locale)}/stats`} className="text-cyanink hover:underline">
              {t.goodhartLink}
            </Link>
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-1">{t.picksHeading}</h3>
        <p className="text-gray-600 text-sm mb-3">{t.picksIntro}</p>
        <div className="space-y-2">
          {NSM_TYPES.map((ty) => (
            <div key={ty.id} className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-gray-500 w-full sm:w-44 shrink-0">{loc(ty.title, locale)}</span>
              {ty.industries.filter((id) => byId[id]).map((id) => (
                <button
                  key={id}
                  onClick={() => onPick(id)}
                  className="text-sm px-2.5 py-1 rounded-md border border-black/10 text-gray-700 hover:bg-black/5 hover:text-cyanink"
                >
                  {byId[id].industry}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
